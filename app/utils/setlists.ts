import type { Song, SongsInSets } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"

export type SetlistFilters = {
  noCovers: boolean
  onlyCovers: boolean
  noBallads: boolean
}
export type SetlistSettings = {
  filters: SetlistFilters
  setCount: number
  setLength: number
}

export const getSetLength = (songs: Pick<SerializeFrom<SongsInSets & { song: Song | null }>, 'song'>[]) => songs.reduce((total, song) => total += song.song?.length || 0, 0)

function randomIntFromMax(max: number) {
  return Math.floor(Math.random() * max)
}

// get a random songs and return all other songs
export const getRandomSong = (songs: Song[]) => {
  const randomSong = songs[randomIntFromMax(songs.length)]
  const remainingSongs = songs.filter(song => song.id !== randomSong.id)
  return {
    randomSong,
    remainingSongs,
  }
}

export const setlistOfSongCountLength = (songs: Song[], songCount: number) => {
  let availableSongs = songs
  const newSet: Song[] = []
  let newSetCount = 0

  while (newSetCount < songCount && availableSongs.length > 0) {
    const { randomSong, remainingSongs } = getRandomSong(availableSongs)
    newSet.push(randomSong)
    availableSongs = remainingSongs
    newSetCount += 1
  }
  return {
    newSet,
    remainingSongs: availableSongs
  }
}

export const setOfLength = (songs: Song[], setLength: number) => {
  const set: Song[] = []
  let newSetLength = 0

  let openers = songs.filter(song => song.position === 'opener')
  let closers = songs.filter(song => song.position === 'closer')
  let others = songs.filter(song => song.position === 'other')

  // adding closers first to backload sets
  while (newSetLength < setLength && closers.length > 0) {
    const { randomSong, remainingSongs } = getRandomSong(closers)
    set.push(randomSong)
    closers = remainingSongs
    newSetLength += randomSong.length
  }
  while (newSetLength < setLength && openers.length > 0) {
    const { randomSong, remainingSongs } = getRandomSong(openers)
    set.push(randomSong)
    openers = remainingSongs
    newSetLength += randomSong.length
  }
  while (newSetLength < setLength && others.length > 0) {
    const { randomSong, remainingSongs } = getRandomSong(others)
    set.push(randomSong)
    others = remainingSongs
    newSetLength += randomSong.length
  }
  return set
}

// filters songs to be used in setlist
const filteredSongs = (filters: SetlistFilters, songs: Song[]) => {
  const { noCovers, onlyCovers, noBallads } = filters
  return songs.filter(song => {
    if (noCovers) {
      return !song.isCover
    }
    if (onlyCovers) {
      return song.isCover
    }
    if (noBallads) {
      return song.tempo > 1
    }
    return song.rank !== 'exclude'
  })
}

// returns a group of openers, closers, or others and the max available per set
const songCountByPostitionPerSet = (songs: Song[], setCount: number, position?: Song['position']) => {
  const songsOfPosition = songs.filter(song => song.position === position)
  // return the number of available songs divided by the set count so that there are enough songs in each set
  // Math.ceil ensures all songs are used
  return {
    songs: songsOfPosition,
    perSet: Math.floor(songsOfPosition.length / setCount)
  }
}

const getSongsOfPositionPerSet = (songs: Song[], setCount: number, position?: Song['position']) => {
  const positionPerSet = songCountByPostitionPerSet(songs, setCount, position)
  let availableSongs = positionPerSet.songs
  const sets = Array.from({ length: setCount }).map(_ => {
    const randomSongs = setlistOfSongCountLength(availableSongs, positionPerSet.perSet)
    availableSongs = randomSongs.remainingSongs
    return randomSongs.newSet
  })
  return { sets, extraSongs: availableSongs }
}

// create sets of songs based on position so each set has a list of openers, closers, and other
// unused or extra songs get returned as well to be used as filler
export const createRandomSetsByPosition = (songs: Song[], setCount: number) => {
  // openers, closers, and others are an even distibution of songs...
  // ...to ensure each set has the minimum number of openers and closers available.
  // extraSongs are then added to each set as available
  const openers = getSongsOfPositionPerSet(songs, setCount, 'opener')
  const closers = getSongsOfPositionPerSet(songs, setCount, 'closer')
  const others = getSongsOfPositionPerSet(songs, setCount, 'other')
  const extraSongs = [...openers.extraSongs, ...closers.extraSongs, ...others.extraSongs]

  const randomSets = Array.from({ length: setCount }, (_, i) => i).reduce((sets: Record<string, Song[]>, index) => {
    return {
      ...sets,
      [index.toString()]: [...openers.sets[index], ...others.sets[index], ...closers.sets[index]]
    }
  }, {})

  // distribute extra songs across sets until all songs are used
  while (extraSongs.length > 0) {
    Object.keys(randomSets).forEach(key => {
      const poppedSong = extraSongs.pop()
      poppedSong && randomSets[key].push(poppedSong)
    })
  }

  return randomSets
}

export const sortSetsByPosition = (sets: Record<string, Song[]>) => {
  // sort by position priority
  const positionPriority = ['opener', 'other', 'closer']
  return Object.keys(sets).reduce((newSets: Record<string, Song[]>, key) => {
    return {
      ...newSets,
      [key]: sets[key].sort((a, b) => {
        return positionPriority.indexOf(a.position || 'other') - positionPriority.indexOf(b.position || 'other')
      })
    }
  }, {})
}

export const autoGenSetlist = (intitialSongs: Song[], settings: SetlistSettings) => {
  const { setCount, setLength, filters } = settings
  const songs = filteredSongs(filters, intitialSongs)

  // split songs into sets by position so each desired set has an even distribution of openers and closers
  const setsByPosition = createRandomSetsByPosition(songs, setCount)

  // trim above sets to desired minute length and sort songs so sets start with openers and end with closers
  const setsByLength = Object.keys(setsByPosition).reduce((sets: Record<string, Song[]>, key) => ({
    ...sets,
    [key]: setOfLength(setsByPosition[key], setLength)
  }), {})

  // sort by position
  const sortedByPosition = sortSetsByPosition(setsByLength)

  return sortedByPosition
}
