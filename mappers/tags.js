import moment from 'moment'

export default response => response.data.repository.refs.nodes.map(tag => ({
  name: tag.name,
  date: moment(tag.target.committedDate)
}))