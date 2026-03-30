export type ProfileTargetInput = {
  sex: string
  age: number
  heightCm: number
  currentWeightKg: number
  activityLevel: string
  targetLossPerWeek: number
}

export function calculateMacroTargets(currentWeightKg: number, dailyCalories: number) {
  const proteinTarget = Math.round(currentWeightKg * 2.2)
  const fatsTarget = Math.round((dailyCalories * 0.25) / 9)
  const carbsTarget = Math.max(0, Math.round((dailyCalories - proteinTarget * 4 - fatsTarget * 9) / 4))

  return {
    proteinTarget,
    fatsTarget,
    carbsTarget,
  }
}

export function calculateProfileTargets(input: ProfileTargetInput) {
  const { sex, age, heightCm, currentWeightKg, activityLevel, targetLossPerWeek } = input

  let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age
  if (sex === 'M') {
    bmr += 5
  } else if (sex === 'F') {
    bmr -= 161
  } else {
    bmr -= 78
  }

  const multipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
  }

  const tdee = bmr * (multipliers[activityLevel] || 1.2)
  const dailyDeficit = targetLossPerWeek * 1000

  let dailyCalories = Math.round(tdee - dailyDeficit)
  if (dailyCalories < 1200) {
    dailyCalories = 1200
  }

  const { proteinTarget, fatsTarget, carbsTarget } = calculateMacroTargets(currentWeightKg, dailyCalories)
  const waterTargetMl = Math.round(currentWeightKg * 35)
  const stepsTarget = 8000

  return {
    bmr,
    tdee,
    dailyCalories,
    proteinTarget,
    fatsTarget,
    carbsTarget,
    waterTargetMl,
    stepsTarget,
  }
}
