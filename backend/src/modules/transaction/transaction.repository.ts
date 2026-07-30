import { sql, eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { transactions, inventory, tradeItems, expenses } from "../../db/schema/index.js";

export class TransactionRepository {
  async postTransactionsBuy(userId: string, body: any) {
    const {
      inventoryId,
      playerName,
      price,
      costBasis,
      channel = "card_show",
      paymentMethod,
      dealRating,
      compPriceAtTime,
      gradeKey,
      cardSnapshot,
      rslCardId,
      dailyLogId,
    } = body;

    if (!playerName || !price) {
      throw new Error("playerName and price are required");
    }

    const result = await db.execute(sql`
      INSERT INTO transactions (
        id, user_id, inventory_id, daily_log_id, type, channel, price, cost_basis,
        payment_method, deal_rating, comp_price_at_time,
        player_name, grade_key, card_snapshot, rsl_card_id, created_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${inventoryId || null},
        ${dailyLogId || null},
        'buy',
        ${channel},
        ${price},
        ${costBasis || price},
        ${paymentMethod || null},
        ${dealRating || null},
        ${compPriceAtTime || null},
        ${playerName},
        ${gradeKey || null},
        ${cardSnapshot || null},
        ${rslCardId || null},
        NOW()
      )
      RETURNING id, created_at
    `);

    const row = result.rows[0] as any;

    if (dailyLogId) {
      await db.execute(sql`
        UPDATE daily_logs 
        SET updated_after_closing = TRUE, updated_at = NOW() 
        WHERE id = ${dailyLogId} AND status = 'closed'
      `);
    }

    return { success: true, id: row.id, createdAt: row.created_at };
  }

  async postTransactionsSell(userId: string, body: any) {
    const {
      inventoryId,
      playerName,
      price,
      costBasis,
      channel = "card_show",
      paymentMethod,
      dealRating,
      compPriceAtTime,
      gradeKey,
      cardSnapshot,
      rslCardId,
      dailyLogId,
    } = body;

    if (!playerName || !price) {
      throw new Error("playerName and price are required");
    }

    if (inventoryId) {
      const invCheck = await db.execute(sql`
        SELECT listing_status FROM inventory WHERE id = ${inventoryId} AND user_id = ${userId} LIMIT 1
      `);
      if (invCheck.rows.length > 0) {
        const itemStatus = (invCheck.rows[0] as any).listing_status;
        if (itemStatus === 'sold') {
          throw new Error("This card has already been sold.");
        }
      }
    }

    const sellPrice = parseFloat(price);
    const cost = parseFloat(costBasis || "0");
    const profit = sellPrice - cost;
    const profitPct = cost > 0 ? Math.round((profit / cost) * 100) : null;

    const result = await db.execute(sql`
      INSERT INTO transactions (
        id, user_id, inventory_id, daily_log_id, type, channel, price, cost_basis,
        profit, profit_pct, payment_method, deal_rating, comp_price_at_time,
        player_name, grade_key, card_snapshot, rsl_card_id, created_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${inventoryId || null},
        ${dailyLogId || null},
        'sell',
        ${channel},
        ${sellPrice},
        ${cost},
        ${profit},
        ${profitPct},
        ${paymentMethod || null},
        ${dealRating || null},
        ${compPriceAtTime || null},
        ${playerName},
        ${gradeKey || null},
        ${cardSnapshot || null},
        ${rslCardId || null},
        NOW()
      )
      RETURNING id, created_at
    `);

    // Mark inventory item as sold
    if (inventoryId) {
      await db.execute(sql`
        UPDATE inventory
        SET listing_status = 'sold', updated_at = NOW()
        WHERE id = ${inventoryId} AND user_id = ${userId}
      `);
    }

    const row = result.rows[0] as any;

    if (dailyLogId) {
      await db.execute(sql`
        UPDATE daily_logs 
        SET updated_after_closing = TRUE, updated_at = NOW() 
        WHERE id = ${dailyLogId} AND status = 'closed'
      `);
    }

    // Send push/SSE/email notification for new sale (only if enabled in preferences)
    try {
      const prefResult = await db.execute(sql`
        SELECT dp.notification_preferences, u.email as user_email
        FROM dealer_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE dp.user_id = ${userId}
        LIMIT 1
      `);
      
      let sendPush = true;
      let sendEmail = false;
      let userEmail = null;

      if (prefResult.rows.length > 0) {
        const rowData = prefResult.rows[0] as any;
        userEmail = rowData.user_email;
        const prefs = rowData.notification_preferences as any;
        if (prefs && prefs.newSales) {
          sendPush = prefs.newSales.push !== false;
          sendEmail = prefs.newSales.email === true;
        }
      }

      const saleTitle = "New Sale Recorded";
      const saleBody = `Sold ${playerName}${gradeKey ? ` (${gradeKey})` : ""} for $${sellPrice.toFixed(2)}. Profit: $${profit.toFixed(2)}${profitPct !== null ? ` (${profitPct}%)` : ""}.`;

      if (sendPush) {
        const { NotificationRepository } = await import("../notification/notification.repository.js");
        const { NotificationService } = await import("../notification/notification.service.js");
        const notifRepository = new NotificationRepository();
        const notifService = new NotificationService(notifRepository);
        await notifService.sendNotification(
          userId,
          saleTitle,
          saleBody,
          "sale",
          { transactionId: row.id }
        );
      }

      if (sendEmail && userEmail) {
        const { emailService } = await import("../email/index.js");
        await emailService.sendNotificationAlert(userEmail, {
          alertTitle: saleTitle,
          alertBody: saleBody,
          actionUrl: `https://app.rslcards.com/transactions`,
          actionText: "View Transaction History",
        });
      }
    } catch (err: any) {
      console.error(`[TRANSACTION] Failed to send new sale notification: ${err.message}`);
    }

    // Invalidate inventory summary cache as item count / value has changed
    try {
      const { redisAdapter } = await import("../../adapters/redis.adapter.js");
      const { REDIS_KEYS } = await import("../../config/redisKeys.js");
      await redisAdapter.delete(REDIS_KEYS.inventorySummary(userId));
    } catch (err: any) {
      console.error(`[TRANSACTION] Redis summary cache invalidate failed: ${err.message}`);
    }

    return { success: true, id: row.id, createdAt: row.created_at, profit, profitPct };
  }

  async resolvePlayerAndVariant(
    tx: any,
    card: {
      playerName?: string;
      sport?: string;
      cardId?: string;
      variantId?: string;
      year?: number;
      setName?: string;
      variation?: string;
      cardNumber?: string;
      playerId?: string;
    }
  ) {
    let resolvedPlayerId = card.playerId;
    let resolvedVariantId = card.variantId;
    let cardId = card.cardId;

    const cleanPlayerName = card.playerName;
    const cleanSport = card.sport || "basketball";
    const cleanYear = card.year || null;
    const cleanSetName = card.setName || null;
    const cleanVariation = card.variation || null;
    const cleanCardNumber = card.cardNumber || null;

    if (!resolvedPlayerId && cleanPlayerName) {
      const existingPlayer = await tx.execute(sql`
        SELECT id FROM players
        WHERE LOWER(name) = LOWER(${cleanPlayerName})
        LIMIT 1
      `);

      if (existingPlayer.rows.length > 0) {
        resolvedPlayerId = (existingPlayer.rows[0] as any).id;
      } else {
        const insertPlayer = await tx.execute(sql`
          INSERT INTO players (id, name, sport, created_at, updated_at)
          VALUES (gen_random_uuid(), ${cleanPlayerName}, ${cleanSport}, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
          RETURNING id
        `);
        resolvedPlayerId = (insertPlayer.rows[0] as any).id;
      }
    }

    if (cardId) {
      const cardExists = await tx.execute(sql`
        SELECT id, player_id FROM cards WHERE id = ${cardId} LIMIT 1
      `);
      if (cardExists.rows.length === 0) {
        const cardByDetails = await tx.execute(sql`
          SELECT id, player_id FROM cards 
          WHERE player_id = ${resolvedPlayerId}
            AND year = ${cleanYear}
            AND set_name = ${cleanSetName}
            ${cleanCardNumber ? sql`AND card_number = ${cleanCardNumber}` : sql`AND card_number IS NULL`}
          LIMIT 1
        `);

        if (cardByDetails.rows.length > 0) {
          const existingCard = cardByDetails.rows[0] as any;
          cardId = existingCard.id;
          resolvedPlayerId = existingCard.player_id;
        } else {
          if (resolvedPlayerId) {
            await tx.execute(sql`
              INSERT INTO cards (id, player_id, year, set_name, card_number, manufacturer, is_rookie, source, created_at, updated_at)
              VALUES (${cardId}, ${resolvedPlayerId}, ${cleanYear}, ${cleanSetName}, ${cleanCardNumber}, null, false, 'fallback', NOW(), NOW())
            `);
          } else {
            cardId = undefined;
          }
        }

        if (cardId) {
          const variantExists = await tx.execute(sql`
            SELECT id FROM card_variants WHERE card_id = ${cardId} AND name = 'Base' LIMIT 1
          `);
          if (variantExists.rows.length === 0) {
            const insertVariant = await tx.execute(sql`
              INSERT INTO card_variants (id, card_id, rsl_card_id, rsl_card_unique_name, year, set_name, name, is_parallel, is_base, created_at, updated_at)
              VALUES (gen_random_uuid(), ${cardId}, 'rsl-' || gen_random_uuid(), ${cardId} || '_base', ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
              RETURNING id
            `);
            if (!resolvedVariantId) {
              resolvedVariantId = (insertVariant.rows[0] as any).id;
            }
          }
        }
      } else {
        const cardRow = cardExists.rows[0] as any;
        if (!resolvedPlayerId) {
          resolvedPlayerId = cardRow.player_id;
        }
      }

      if (!resolvedVariantId && cardId) {
        const varExists = await tx.execute(sql`
          SELECT id FROM card_variants WHERE card_id = ${cardId} AND name = 'Base' LIMIT 1
        `);
        if (varExists.rows.length > 0) {
          resolvedVariantId = (varExists.rows[0] as any).id;
        } else {
          const insertVariant = await tx.execute(sql`
            INSERT INTO card_variants (id, card_id, rsl_card_id, rsl_card_unique_name, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${cardId}, 'rsl-' || gen_random_uuid(), ${cardId} || '_base', ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
            RETURNING id
          `);
          resolvedVariantId = (insertVariant.rows[0] as any).id;
        }
      }
    }

    return { resolvedPlayerId, resolvedVariantId, cardId };
  }

  async insertInventoryItemRaw(
    tx: any,
    userId: string,
    params: any
  ) {
    const {
      cardId,
      variantId,
      playerId,
      year,
      setName,
      variation,
      cardNumber,
      sport,
      gradeCompany,
      gradeValue,
      gradeKey,
      certNumber,
      costBasis,
      currentMarketValue,
      photos,
      notes,
      ebaySalesCompleted,
      ebayActiveListings,
      myslabsSalesCompleted,
      myslabsActiveListings,
      search_string,
      searchString,
    } = params;

    const photosArr = Array.isArray(photos) && photos.length > 0
      ? `{${photos.map((u: string) => `"${u.replace(/"/g, '\\"')}"`).join(",")}}`
      : null;

    const cleanEbaySalesCompleted = ebaySalesCompleted && ebaySalesCompleted !== "" ? ebaySalesCompleted : null;
    const cleanEbayActiveListings = ebayActiveListings && ebayActiveListings !== "" ? ebayActiveListings : null;
    const cleanMyslabsSalesCompleted = myslabsSalesCompleted && myslabsSalesCompleted !== "" ? myslabsSalesCompleted : null;
    const cleanMyslabsActiveListings = myslabsActiveListings && myslabsActiveListings !== "" ? myslabsActiveListings : null;
    const cleanSearchString = (search_string || searchString)?.trim() || null;

    if (variantId && cleanSearchString) {
      await tx.execute(sql`
        UPDATE card_variants 
        SET search_string = ${cleanSearchString}, updated_at = NOW() 
        WHERE id = ${variantId} AND (search_string IS NULL OR search_string = '')
      `);
    }

    const result = await tx.execute(sql`
      INSERT INTO inventory (
        id, user_id, card_id, variant_id, player_id, year, set_name, variation, card_number, sport,
        grade_company, grade_value, grade_key, cert_number, cost_basis, current_market_value,
        quantity, photos, notes, ebay_sales_completed, ebay_active_listings, myslabs_sales_completed, myslabs_active_listings, search_string, listing_status, added_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${cardId || null},
        ${variantId || null},
        ${playerId || null},
        ${year || null},
        ${setName || null},
        ${variation || null},
        ${cardNumber || null},
        ${sport || null},
        ${gradeCompany || null},
        ${gradeValue || null},
        ${gradeKey || 'RAW'},
        ${certNumber || null},
        ${costBasis},
        ${currentMarketValue || null},
        1,
        ${photosArr}::text[],
        ${notes || null},
        ${cleanEbaySalesCompleted},
        ${cleanEbayActiveListings},
        ${cleanMyslabsSalesCompleted},
        ${cleanMyslabsActiveListings},
        ${cleanSearchString},
        'unlisted',
        NOW(),
        NOW()
      )
      RETURNING id
    `);

    return (result.rows[0] as any).id as string;
  }

  async postTransactionsTrade(userId: string, body: any) {
    const {
      price, // net cash adjustment (negative if cash paid, positive if cash received)
      paymentMethod,
      channel = "card_show",
      dailyLogId,
      localId,
      cardsGiven = [],    // array of { inventoryId: string, playerName: string, gradeKey: string, marketValue: number }
      cardsReceived = [], // array of { playerName: string, gradeKey: string, marketValue: number, year: number, setName: string, variation: string, cardNumber: string, sport: string, gradeCompany: string, gradeValue: string }
      createdAt,
    } = body;

    // Build trade summary title for transaction history
    let tradeSummaryTitle = "Trade Transaction";
    if (cardsGiven.length === 1 && cardsReceived.length === 1) {
      tradeSummaryTitle = `Traded ${cardsGiven[0].playerName || 'Card'} → ${cardsReceived[0].playerName || 'Card'}`;
    } else if (cardsGiven.length > 0 || cardsReceived.length > 0) {
      tradeSummaryTitle = `Trade (${cardsGiven.length} Given, ${cardsReceived.length} Received)`;
    }

    // Use a DB transaction to ensure consistency
    return await db.transaction(async (tx) => {
      // 1. Insert trade transaction
      const newTxRes = await tx.execute(sql`
        INSERT INTO transactions (
          id, user_id, type, channel, price, payment_method, player_name, daily_log_id, local_id, created_at
        ) VALUES (
          gen_random_uuid(),
          ${userId},
          'trade',
          ${channel},
          ${price || 0},
          ${paymentMethod || null},
          ${tradeSummaryTitle},
          ${dailyLogId || null},
          ${localId || null},
          ${createdAt ? new Date(createdAt) : new Date()}
        )
        RETURNING id, created_at
      `);

      const row = newTxRes.rows[0] as any;

      // 2. Process cards received (adds to inventory)
      for (const card of cardsReceived) {
        const { resolvedPlayerId, resolvedVariantId, cardId: finalCardId } =
          await this.resolvePlayerAndVariant(tx, {
            playerName: card.playerName,
            sport: card.sport,
            cardId: card.cardId,
            variantId: card.variantId,
            year: card.year,
            setName: card.setName,
            variation: card.variation,
            cardNumber: card.cardNumber,
          });

        const invId = await this.insertInventoryItemRaw(tx, userId, {
          cardId: finalCardId,
          variantId: resolvedVariantId,
          playerId: resolvedPlayerId,
          year: card.year,
          setName: card.setName,
          variation: card.variation,
          cardNumber: card.cardNumber,
          sport: card.sport,
          gradeCompany: card.gradeCompany,
          gradeValue: card.gradeValue,
          gradeKey: card.gradeKey,
          certNumber: card.certNumber || null,
          costBasis: card.costBasis || 0,
          currentMarketValue: card.marketValue,
          photos: card.photos,
        });

        await tx.execute(sql`
          INSERT INTO trade_items (id, transaction_id, direction, inventory_id, player_name, grade_key, market_value)
          VALUES (gen_random_uuid(), ${row.id}, 'received', ${invId}, ${card.playerName}, ${card.gradeKey || 'RAW'}, ${card.marketValue || 0})
        `);
      }

      // 3. Process cards given (leaves inventory)
      for (const card of cardsGiven) {
        if (card.inventoryId) {
          await tx.execute(sql`
            UPDATE inventory
            SET listing_status = 'sold', updated_at = NOW()
            WHERE id = ${card.inventoryId} AND user_id = ${userId}
          `);
        }

        await tx.execute(sql`
          INSERT INTO trade_items (id, transaction_id, direction, inventory_id, player_name, grade_key, market_value)
          VALUES (gen_random_uuid(), ${row.id}, 'given', ${card.inventoryId || null}, ${card.playerName}, ${card.gradeKey || 'RAW'}, ${card.marketValue || 0})
        `);
      }

      if (dailyLogId) {
        await tx.execute(sql`
          UPDATE daily_logs 
          SET updated_after_closing = TRUE, updated_at = NOW() 
          WHERE id = ${dailyLogId} AND status = 'closed'
        `);
      }

      return { success: true, id: row.id, createdAt: row.created_at };
    });
  }

  async postTransactionsSync(userId: string, body: any) {
    const { transactions: pendingTxs = [], expenses: pendingExpenses = [] } = body;
    const results = {
      transactions: [] as any[],
      expenses: [] as any[],
    };

    // 1. Sync expenses
    for (const exp of pendingExpenses) {
      try {
        const { localId, payload } = exp;
        if (!localId) continue;

        // Check if duplicate
        const [existing] = await db
          .select({ id: expenses.id })
          .from(expenses)
          .where(eq(expenses.localId, localId))
          .limit(1);

        if (existing) {
          results.expenses.push({ localId, status: "synced", duplicate: true });
          continue;
        }

        await db.insert(expenses).values({
          userId,
          dailyLogId: payload.dailyLogId || null,
          localId,
          category: payload.category || "other",
          description: payload.description || null,
          amount: payload.amount.toString(),
          expenseDate: payload.expenseDate ? new Date(payload.expenseDate) : new Date(),
          createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
        });

        results.expenses.push({ localId, status: "success" });
      } catch (err: any) {
        results.expenses.push({ localId: exp.localId, status: "failed", error: err.message });
      }
    }

    // 2. Sync transactions
    for (const txItem of pendingTxs) {
      const { localId, type, payload } = txItem;
      if (!localId) continue;

      try {
        // Check duplicate
        const [existing] = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(eq(transactions.localId, localId))
          .limit(1);

        if (existing) {
          results.transactions.push({ localId, status: "synced", duplicate: true });
          continue;
        }

        if (type === "buy") {
          const { resolvedPlayerId, resolvedVariantId, cardId: finalCardId } =
            await this.resolvePlayerAndVariant(db, {
              playerName: payload.playerName,
              sport: payload.sport,
              cardId: payload.cardId,
              variantId: payload.variantId,
              year: payload.year,
              setName: payload.setName,
              variation: payload.variation,
              cardNumber: payload.cardNumber,
              playerId: payload.playerId,
            });

          const invId = await this.insertInventoryItemRaw(db, userId, {
            cardId: finalCardId,
            variantId: resolvedVariantId,
            playerId: resolvedPlayerId,
            year: payload.year,
            setName: payload.setName,
            variation: payload.variation,
            cardNumber: payload.cardNumber,
            sport: payload.sport,
            gradeCompany: payload.gradeCompany,
            gradeValue: payload.gradeValue,
            gradeKey: payload.gradeKey,
            costBasis: payload.costBasis,
            currentMarketValue: payload.currentMarketValue,
            photos: payload.photos,
            notes: payload.notes,
          });

          await db.execute(sql`
            INSERT INTO transactions (
              id, user_id, inventory_id, daily_log_id, type, channel, price, cost_basis,
              payment_method, deal_rating, comp_price_at_time, player_name, grade_key,
              card_snapshot, local_id, created_at
            ) VALUES (
              gen_random_uuid(),
              ${userId},
              ${invId},
              ${payload.dailyLogId || null},
              'buy',
              ${payload.channel || 'card_show'},
              ${payload.costBasis},
              ${payload.costBasis},
              ${payload.paymentMethod || null},
              ${payload.dealRating || null},
              ${payload.currentMarketValue || null},
              ${payload.playerName},
              ${payload.gradeKey || 'RAW'},
              ${payload.cardSnapshot || null},
              ${localId},
              ${payload.createdAt ? new Date(payload.createdAt) : new Date()}
            )
          `);

          results.transactions.push({ localId, status: "success", inventoryId: invId });
        } else if (type === "sell") {
          let resolvedInvId = payload.inventoryId;
          
          if (!resolvedInvId && payload.localInventoryId) {
            const [buyTx] = await db
              .select({ inventoryId: transactions.inventoryId })
              .from(transactions)
              .where(eq(transactions.localId, payload.localInventoryId))
              .limit(1);
            if (buyTx) resolvedInvId = buyTx.inventoryId;
          }

          if (resolvedInvId) {
            const invCheck = await db.execute(sql`
              SELECT listing_status FROM inventory WHERE id = ${resolvedInvId} AND user_id = ${userId} LIMIT 1
            `);
            if (invCheck.rows.length > 0 && (invCheck.rows[0] as any).listing_status === 'sold') {
              results.transactions.push({ localId, status: "skipped", message: "Card already sold" });
              continue;
            }
          }

          const sellPrice = parseFloat(payload.price);
          const cost = parseFloat(payload.costBasis || "0");
          const profit = sellPrice - cost;
          const profitPct = cost > 0 ? Math.round((profit / cost) * 100) : null;

          await db.execute(sql`
            INSERT INTO transactions (
              id, user_id, inventory_id, daily_log_id, type, channel, price, cost_basis,
              profit, profit_pct, payment_method, deal_rating, comp_price_at_time,
              player_name, grade_key, card_snapshot, local_id, created_at
            ) VALUES (
              gen_random_uuid(),
              ${userId},
              ${resolvedInvId || null},
              ${payload.dailyLogId || null},
              'sell',
              ${payload.channel || 'card_show'},
              ${sellPrice},
              ${cost},
              ${profit},
              ${profitPct},
              ${payload.paymentMethod || null},
              ${payload.dealRating || null},
              ${payload.compPriceAtTime || null},
              ${payload.playerName},
              ${payload.gradeKey || 'RAW'},
              ${payload.cardSnapshot || null},
              ${localId},
              ${payload.createdAt ? new Date(payload.createdAt) : new Date()}
            )
          `);

          if (resolvedInvId) {
            await db.execute(sql`
              UPDATE inventory
              SET listing_status = 'sold', updated_at = NOW()
              WHERE id = ${resolvedInvId} AND user_id = ${userId}
            `);
          }

          results.transactions.push({ localId, status: "success" });
        } else if (type === "trade") {
          const resolvedCardsGiven = [];
          for (const card of payload.cardsGiven || []) {
            let invId = card.inventoryId;
            if (!invId && card.localInventoryId) {
              const [buyTx] = await db
                .select({ inventoryId: transactions.inventoryId })
                .from(transactions)
                .where(eq(transactions.localId, card.localInventoryId))
                .limit(1);
              if (buyTx) invId = buyTx.inventoryId;
            }
            resolvedCardsGiven.push({ ...card, inventoryId: invId });
          }

          const tradeBody = {
            price: payload.price,
            paymentMethod: payload.paymentMethod,
            channel: payload.channel,
            dailyLogId: payload.dailyLogId,
            localId,
            cardsGiven: resolvedCardsGiven,
            cardsReceived: payload.cardsReceived,
            createdAt: payload.createdAt,
          };

          const tradeRes = await this.postTransactionsTrade(userId, tradeBody);
          results.transactions.push({ localId, status: "success", transactionId: tradeRes.id });
        }
      } catch (err: any) {
        results.transactions.push({ localId, status: "failed", error: err.message });
      }
    }

    return results;
  }

  async getTransactions(userId: string, query: any) {
    const {
      type,
      channel,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = query || {};

    const offset = (Number(page) - 1) * Number(limit);

    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.type,
        t.channel,
        t.player_name,
        t.grade_key,
        t.price,
        t.cost_basis,
        t.profit,
        t.profit_pct,
        t.payment_method,
        t.deal_rating,
        t.comp_price_at_time,
        t.created_at,
        i.photos as inventory_photos
      FROM transactions t
      LEFT JOIN inventory i ON t.inventory_id = i.id
      WHERE t.user_id = ${userId}
      ${type ? sql`AND t.type = ${type}` : sql``}
      ${channel ? sql`AND t.channel = ${channel}` : sql``}
      ${search ? sql`AND (t.player_name ILIKE ${'%' + search + '%'} OR t.grade_key ILIKE ${'%' + search + '%'})` : sql``}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
      ORDER BY t.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM transactions t
      WHERE t.user_id = ${userId}
      ${type ? sql`AND t.type = ${type}` : sql``}
      ${channel ? sql`AND t.channel = ${channel}` : sql``}
      ${search ? sql`AND (t.player_name ILIKE ${'%' + search + '%'} OR t.grade_key ILIKE ${'%' + search + '%'})` : sql``}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
    `);

    return {
      items: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0]?.total || 0),
      },
    };
  }

  async getTransactionsId(userId: string, id: string) {
    const result = await db.execute(sql`
      SELECT t.*, i.photos as inventory_photos, i.set_name, i.year, i.card_number
      FROM transactions t
      LEFT JOIN inventory i ON t.inventory_id = i.id
      WHERE t.id = ${id} AND t.user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Transaction not found");
    }

    return result.rows[0];
  }

  async getTransactionsToday(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price) FILTER (WHERE type = 'buy'), 0)           AS total_spent,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0)          AS total_revenue,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0)         AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE
    `);
    const r = (rows.rows[0] as any) ?? {};
    return {
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: parseFloat(r.total_revenue ?? "0").toFixed(2),
      net_profit: parseFloat(r.net_profit ?? "0").toFixed(2),
    };
  }

  async getTransactionsCustomersCustomerId(userId: string, customerId: string) {
    const result = await db.execute(sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId} AND customer_id = ${customerId}
      ORDER BY created_at DESC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getTransactionsExport(userId: string, query: any) {
    const { dateFrom, dateTo } = query ?? {};

    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.type,
        t.channel,
        t.player_name,
        t.grade_key,
        t.price,
        t.cost_basis,
        t.profit,
        t.profit_pct,
        t.payment_method,
        t.deal_rating,
        t.comp_price_at_time,
        t.created_at
      FROM transactions t
      WHERE t.user_id = ${userId}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
      ORDER BY t.created_at DESC
    `);

    return { rows: result.rows, total: result.rows.length };
  }

  async deleteTransactionsId(userId: string, id: string) {
    const txRow = await db.execute(sql`
      SELECT daily_log_id FROM transactions WHERE id = ${id} AND user_id = ${userId} LIMIT 1
    `);

    const result = await db.execute(sql`
      DELETE FROM transactions
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `);
    if (result.rows.length === 0) {
      throw new Error("Transaction not found or not owned by user");
    }

    const dailyLogId = txRow.rows[0]?.daily_log_id;
    if (dailyLogId) {
      await db.execute(sql`
        UPDATE daily_logs 
        SET updated_after_closing = TRUE, updated_at = NOW() 
        WHERE id = ${dailyLogId} AND status = 'closed'
      `);
    }

    return { success: true, id: result.rows[0].id };
  }
}
