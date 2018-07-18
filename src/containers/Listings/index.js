import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import styled from 'styled-components'
import AppBar from 'material-ui/AppBar'
import { withStyles } from 'material-ui/styles'
import Tabs, { Tab } from 'material-ui/Tabs'
import { TablePagination, TableRow } from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import {
  show,
  success,
  error,
  warning,
  info,
  hide,
  removeAll,
} from 'react-notification-system-redux'

import ListingCard from './ListingCard'
import { colors } from '../../global-styles'

import {
  selectAllListings,
  selectFaceoffs,
  selectWhitelist,
  selectCandidates,
  onlyCandidateIDs,
  onlyFaceoffIDs,
  onlyWhitelistIDs,
} from 'modules/listings/selectors'
import { selectStats } from 'modules/home/selectors'
import * as actions from 'modules/listings/actions'

import Transactions from 'containers/Transactions/Loadable'

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.textSecondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
  prevPage: {
    position: 'fixed',
    left: '30px',
    top: '45%',
    height: '5em',
    width: '5em',
  },
  nextPage: {
    position: 'fixed',
    right: '30px',
    top: '45%',
    height: '5em',
    width: '5em',
  },
})

class TablePaginationActions extends React.Component {
  componentDidMount() {
    this.handleKeyPress()
  }
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0)
  }

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1)
  }

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1)
  }

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
    )
  }
  handleKeyPress = () => {
    document.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft' && this.props.page !== 0) {
        this.handleBackButtonClick(e)
      } else if (
        e.code === 'ArrowRight' &&
        !(this.props.page >= Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
      ) {
        this.handleNextButtonClick(e)
      }
    })
  }

  render() {
    const { classes, count, page, rowsPerPage } = this.props

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
          className={classes.prevPage}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
          className={classes.nextPage}
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          <LastPageIcon />
        </IconButton>
      </div>
    )
  }
}

const TablePaginationActionsWrapped = withStyles(actionsStyles)(TablePaginationActions)

const ListingsWrapper = styled.div`
  width: 80vw;
  margin: 20px auto 0;
`
const FlexContainer = styled.div`
  display: flex;
  margin: 30px auto 0;
`

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.contentBackground,
    boxShadow: '0 0 0 0',
  },
  tableWrapper: {
    // overflowX: 'auto',
    padding: '0',
  },
  appBar: {
    boxShadow: '0 0 0 0',
    borderBottom: `.5px solid ${colors.paleGrey}`,
  },
  tab: {
    '& > span': {
      '& > span': {
        paddingLeft: '5px',
      },
    },
    fontWeight: 'bold',
  },
  caption: {
    display: 'none',
  },
})

class SimpleTabs extends Component {
  state = {
    value: 0,
    page: 0,
    rowsPerPage: 5,
  }
  componentDidMount() {
    this.props.onDispatchNotification()
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1))

    this.setState({ data, order, orderBy })
  }

  openSidePanel = (one, openThis) => {
    this.props.onOpenSidePanel(one, openThis)
  }
  render() {
    const {
      registry,
      candidates,
      faceoffs,
      whitelist,
      stats,
      candidateIDs,
      faceoffIDs,
      whitelistIDs,
      chooseTCR,
      classes,
    } = this.props
    const { rowsPerPage, page, value } = this.state

    let data
    if (value === 0) {
      data = whitelistIDs
    } else if (value === 1) {
      data = candidateIDs
    } else if (value === 2) {
      data = faceoffIDs
    }
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)

    return (
      <Transactions>
        <ListingsWrapper>
          <Paper className={classes.root}>
            <AppBar className={classes.appBar} position="static" color="inherit">
              <Tabs
                centered={false}
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
              >
                <Tab
                  className={classes.tab}
                  label={`registry (${stats.sizes.whitelist})`}
                />
                <Tab
                  className={classes.tab}
                  label={`applications (${stats.sizes.candidates})`}
                />
                <Tab className={classes.tab} label={`voting (${stats.sizes.faceoffs})`} />
              </Tabs>
            </AppBar>
            <div className={classes.tableWrapper}>
              <FlexContainer>
                {value === 0 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={whitelist.get(id)}
                          listingType={'whitelist'}
                          openSidePanel={this.openSidePanel}
                          chooseTCR={chooseTCR}
                          registry={registry}
                          tokenData={whitelist.getIn([id, 'tokenData'])}
                        />
                      )
                    })}
                {value === 1 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={candidates.get(id)}
                          listingType={'candidates'}
                          openSidePanel={this.openSidePanel}
                          updateTrigger={candidates.getIn([id, 'appExpiry', 'expired'])}
                          tokenData={candidates.getIn([id, 'tokenData'])}
                        />
                      )
                    })}
                {value === 2 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={faceoffs.get(id)}
                          listingType={'faceoffs'}
                          openSidePanel={this.openSidePanel}
                          updateTrigger={faceoffs.getIn([id, 'revealExpiry', 'expired'])}
                          revealTrigger={faceoffs.getIn([id, 'commitExpiry', 'expired'])}
                          tokenData={faceoffs.getIn([id, 'tokenData'])}
                        />
                      )
                    })}
              </FlexContainer>
              {emptyRows === 5 && (
                <TableRow component="div" style={{ height: 80 * emptyRows }}>
                  <div />
                </TableRow>
              )}

              <TablePagination
                component="span"
                colSpan={3}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.handleChangePage}
                Actions={TablePaginationActionsWrapped}
                classes={{
                  toolbar: classes.toolbar,
                  caption: classes.caption,
                }}
              />
            </div>
          </Paper>
        </ListingsWrapper>
      </Transactions>
    )
  }
}

function mapDispatchToProps(dispatch) {
  const noti = {
    uid: '0x',
    title: 'titleaasdad',
    position: 'tl',
    autoDismiss: 5,
    action: {
      label: 'cb',
      callback: () => {
        console.log('click')
        alert('click')
      },
    },
  }
  return {
    onOpenSidePanel: (selectedOne, openThis) =>
      dispatch(actions.openSidePanel(selectedOne, openThis)),
    onDispatchNotification: () => dispatch(success(noti)),
  }
}

const mapStateToProps = createStructuredSelector({
  allListings: selectAllListings,
  candidates: selectCandidates,
  candidateIDs: onlyCandidateIDs,
  faceoffs: selectFaceoffs,
  faceoffIDs: onlyFaceoffIDs,
  whitelist: selectWhitelist,
  whitelistIDs: onlyWhitelistIDs,
  stats: selectStats,
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(withStyles(styles)(withConnect(SimpleTabs)))
