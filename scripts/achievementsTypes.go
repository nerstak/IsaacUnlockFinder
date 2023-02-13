package main

type Achievement struct {
  Id                      string
  Link                    string
  Name                    string
  Description             string
  UnlockMethod            string
  RequiredForAchievements []string
}

func (a *Achievement) Copy(newId string) *Achievement {
  return &Achievement{
    Id:                      newId,
    Link:                    a.Link,
    Name:                    a.Name,
    Description:             a.Description,
    UnlockMethod:            a.UnlockMethod,
    RequiredForAchievements: a.RequiredForAchievements,
  }
}
