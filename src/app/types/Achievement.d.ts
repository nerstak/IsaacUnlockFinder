interface Achievement {
  Id: string

  Name: string
  Link: string | undefined
  Description: string
  UnlockMethod: string
  RequiredForAchievements: string[] | null
}
