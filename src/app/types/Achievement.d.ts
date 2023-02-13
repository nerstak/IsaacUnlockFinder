interface Achievement {
  Id: string
  Link: string | undefined
  Description: string
  UnlockMethod: string
  RequiredForAchievements: string[] | null
}
