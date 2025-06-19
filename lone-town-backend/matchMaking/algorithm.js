const User = require("../models/User");
const Match = require("../models/Match");

const getCompatibilityScore = (user1, user2) => {
  const t1 = user1.compatibilityTraits;
  const t2 = user2.compatibilityTraits;

  let score = 0;
  score += 100 - Math.abs(t1.emotionalIntelligence - t2.emotionalIntelligence);
  score += t1.lifestyle === t2.lifestyle ? 20 : 0;
  score += t1.values.filter(val => t2.values.includes(val)).length * 10;

  return score;
};

const matchUsers = async () => {
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

      const score = getCompatibilityScore(userA, userB);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = userB;
      }
    }

    if (bestMatch) {
      const match = await Match.create({
        userA: userA._id,
        userB: bestMatch._id,
      });

      await User.findByIdAndUpdate(userA._id, {
        currentMatch: match._id,
        state: "matched",
      });

      await User.findByIdAndUpdate(bestMatch._id, {
        currentMatch: match._id,
        state: "matched",
      });

      matched.add(userA.id);
      matched.add(bestMatch.id);
    }
  }
};

module.exports = matchUsers;




