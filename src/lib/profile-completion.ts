type NullableProfileFields = {
  age?: number | null
  height_cm?: number | null
  current_weight_kg?: number | null
  goal_weight_kg?: number | null
  activity_level?: string | null
  target_loss_per_week?: number | null
  daily_calorie_target?: number | null
  daily_water_target_ml?: number | null
  daily_steps_target?: number | null
}

export function hasCompletedProfile(profile: NullableProfileFields | null | undefined) {
  if (!profile) {
    return false
  }

  return Boolean(
    profile.age &&
      profile.height_cm &&
      profile.current_weight_kg &&
      profile.goal_weight_kg &&
      profile.activity_level &&
      profile.target_loss_per_week !== null &&
      profile.target_loss_per_week !== undefined &&
      profile.daily_calorie_target &&
      profile.daily_water_target_ml &&
      profile.daily_steps_target
  )
}
