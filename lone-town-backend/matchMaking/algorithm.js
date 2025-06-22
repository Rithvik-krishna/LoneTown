const User = require("../models/User");
const Match = require("../models/Match");
const MatchQueue = require("../models/MatchQueue");
const mongoose = require("mongoose");

// 🔢 Basic Compatibility Score (from first version)
const getBasicCompatibilityScore = (user1, user2) => {
  const t1 = user1.compatibilityTraits;
  const t2 = user2.compatibilityTraits;

  let score = 0;
  score += 100 - Math.abs(t1.emotionalIntelligence - t2.emotionalIntelligence);
  score += t1.lifestyle === t2.lifestyle ? 20 : 0;
  score += t1.values.filter(val => t2.values.includes(val)).length * 10;

  return score;
};

// 🌟 Enhanced Compatibility Score (from second version)
const getEnhancedCompatibilityScore = (user1, user2) => {
  const t1 = user1.onboarding || {};
  const t2 = user2.onboarding || {};

  let score = 0;

  if (t1.loveLanguage === t2.loveLanguage) score += 50;
  if (t1.attachmentStyle === t2.attachmentStyle) score += 30;
  if (t1.communicationStyle === t2.communicationStyle) score += 20;

  const sharedValues = t1.values?.filter(val => t2.values?.includes(val));
  score += (sharedValues?.length || 0) * 10;

  return Math.min(100, score);
};

// 🧠 Match all available users (non-queued)
const matchAllAvailableUsers = async () => {
  const availableUsers = await User.find({ state: "available" });

  let matched = new Set();

  for (let i = 0; i < availableUsers.length; i++) {
    const userA = availableUsers[i];
    if (matched.has(userA.id)) continue;

    let bestScore = 0;
    let bestMatch = null;

    for (let j = i + 1; j < availableUsers.length; j++) {
      const userB = availableUsers[j];
      if (matched.has(userB.id)) continue;

      const score = getBasicCompatibilityScore(userA, userB);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = userB;
      }
    }

    if (bestMatch) {
      const match = await Match.create({
        userA: userA._id,
        userB: bestMatch._id,
        compatibilityScore: bestScore
      });

      await User.updateMany(
        { _id: { $in: [userA._id, bestMatch._id] } },
        {
          $set: {
            currentMatch: match._id,
            state: "matched",
          }
        }
      );

      matched.add(userA.id);
      matched.add(bestMatch.id);
    }
  }
};

// 🚦 Match queued users using enhanced scoring and socket emit
const matchUsers = async (io) => {
  try {
    const queuedUsers = await MatchQueue.find()
      .populate('user')
      .lean();

    console.log(`🔍 Matching ${queuedUsers.length} queued users`);

    let matchedPairs = [];
    const matchedIds = new Set();

    for (let i = 0; i < queuedUsers.length; i++) {
      const userA = queuedUsers[i];
      if (matchedIds.has(userA.userId)) continue;

      let bestScore = 0;
      let bestMatch = null;

      for (let j = i + 1; j < queuedUsers.length; j++) {
        const userB = queuedUsers[j];
        if (matchedIds.has(userB.userId)) continue;

        const score = getEnhancedCompatibilityScore(userA.user, userB.user);
        if (score > bestScore && score >= 60) {
          bestScore = score;
          bestMatch = userB;
        }
      }

      if (bestMatch) {
        const match = await Match.create({
          users: [userA.userId, bestMatch.userId],
          compatibilityScore: bestScore
        });

        await User.updateMany(
          { _id: { $in: [userA.userId, bestMatch.userId] } },
          {
            $set: {
              currentMatch: match._id,
              state: "matched",
            }
          }
        );

        await MatchQueue.deleteMany({
          userId: { $in: [userA.userId, bestMatch.userId] }
        });

        if (io) {
          io.to(userA.userId).emit("matchFound", {
            matchId: match._id,
            partnerId: bestMatch.userId,
          });
          io.to(bestMatch.userId).emit("matchFound", {
            matchId: match._id,
            partnerId: userA.userId,
          });
        }

        matchedPairs.push({
          userA: userA.userId,
          userB: bestMatch.userId,
          score: bestScore
        });

        matchedIds.add(userA.userId);
        matchedIds.add(bestMatch.userId);
      }
    }

    console.log(`🎯 Created ${matchedPairs.length} matches`);
    return matchedPairs;

  } catch (err) {
    console.error("❌ Matching error:", err);
    throw err;
  }
};

// 🕒 Background matching runner
const startMatchingInterval = (io) => {
  setInterval(async () => {
    try {
      console.log("🕒 Running background matchmaking...");
      await matchUsers(io);
    } catch (err) {
      console.error("Interval matching error:", err);
    }
  }, 5 * 60 * 1000); // every 5 minutes
};

module.exports = {
  getBasicCompatibilityScore,
  getEnhancedCompatibilityScore,
  matchAllAvailableUsers,
  matchUsers,
  startMatchingInterval
};
