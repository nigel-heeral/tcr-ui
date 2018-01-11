import { createSelector } from 'reselect'

export const selectHome = state => state.get('home')

export const selectParameters = createSelector(
  selectHome, homeState => homeState.get('parameters')
)
export const selectWallet = createSelector(
  selectHome, homeState => homeState.get('wallet')
)
export const selectAccount = createSelector(
  selectWallet, wallet =>
    wallet.get('address')
)

// All listings
export const selectAllListings = createSelector(
  selectHome, homeState =>
    homeState.get('listings')
)
export const selectAllListingsByListing = createSelector(
  selectAllListings, listings =>
    listings.get('byListing')
)
// export const selectPollID = createSelector(
//   selectAllListingsByListing, listings =>
//     listings.get('pollID')
// )

// Candidate listings
export const selectCandidates = createSelector(
  selectAllListingsByListing, listings =>
    listings.filter(li => (
      (!li.getIn(['latest', 'whitelisted']) && !li.getIn(['latest', 'pollID']))
    ))
)

// Only voteable listings
export const selectFaceoffs = createSelector(
  selectAllListingsByListing, listings =>
    listings.filter(li => (
      (!li.getIn(['latest', 'whitelisted']) && li.getIn(['latest', 'pollID']))
    ))
)

// Only whitelisted listings
export const selectWhitelist = createSelector(
  selectAllListingsByListing, listings =>
    listings.filter(li => li.getIn(['latest', 'whitelisted']))
)
