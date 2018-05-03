export const setDuplicates = (context, payload) => {
  localStorage.setItem('duplicates', JSON.stringify(payload))
  context.commit('setDuplicates', payload)
}

export const setLastFolder = (context, payload) => {
  localStorage.setItem('lastFolder', JSON.stringify(payload))
  context.commit('setLastFolder', payload)
}
