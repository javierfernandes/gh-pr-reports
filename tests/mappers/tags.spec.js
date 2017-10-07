import mapper from '../../mappers/tags'
import { expect } from 'chai'
import moment from 'moment'

describe('tags mapper', () => {
  
  it('should support a sample graqphl response', () => {
    const sample = {
      "data": {
        "repository": {
          "refs": {
            "nodes": [
              {
                "name": "v1.0.0",
                "target": {
                  "committedDate": "2017-10-02T21:30:13Z"
                }
              },
              {
                "name": "v1.0.1",
                "target": {
                  "committedDate": "2017-10-03T17:57:52Z"
                }
              },
              {
                "name": "v1.0.2",
                "target": {
                  "committedDate": "2017-10-06T20:34:56Z"
                }
              }
            ]
          }
        }
      }
    }
    expect(mapper(sample)).to.deep.equal([
      { name: "v1.0.0", date: moment("2017-10-02T21:30:13Z") },
      { name: "v1.0.1", date: moment("2017-10-03T17:57:52Z") },
      { name: "v1.0.2", date: moment("2017-10-06T20:34:56Z") },
    ])
  })

})