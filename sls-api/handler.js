'use strict';
const aws = require('aws-sdk')
const db = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
const uuid = require('uuid/v4')

const postsTable = process.env.POSTS_TABLE
//Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  }
}

function sortByDate(a, b) {
  if (a.createdAt > b.createdAt) {
    return -1
  } else {
    return 1
  }
}

/*
..######..########..########....###....########.########....########...#######...######..########
.##....##.##.....##.##.........##.##......##....##..........##.....##.##.....##.##....##....##...
.##.......##.....##.##........##...##.....##....##..........##.....##.##.....##.##..........##...
.##.......########..######...##.....##....##....######......########..##.....##..######.....##...
.##.......##...##...##.......#########....##....##..........##........##.....##.......##....##...
.##....##.##....##..##.......##.....##....##....##..........##........##.....##.##....##....##...
..######..##.....##.########.##.....##....##....########....##.........#######...######.....##...
*/
module.exports.createPost = (event, context, callback) => {
  const reqBody = JSON.parse(event.body)

  if (!reqBody.title || reqBody.title.trim() === '' || !reqBody.body || reqBody.body.trim() === '') {
    return callback(null, response(400, { error: 'Post must have a title and a body and they must not be empty' }))
  }

  const post = {
    id: reqBody.id,
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body,
    name: reqBody.name
  }

  return db.put({
    TableName: postsTable,
    Item: post
  }).promise().then(() => {
    callback(null, response(201, post))
  }).catch(err => response(null, response(err.statusCode, err)))
}

/*
..######...########.########.......###....##.......##..........########...#######...######..########..######.
.##....##..##..........##.........##.##...##.......##..........##.....##.##.....##.##....##....##....##....##
.##........##..........##........##...##..##.......##..........##.....##.##.....##.##..........##....##......
.##...####.######......##.......##.....##.##.......##..........########..##.....##..######.....##.....######.
.##....##..##..........##.......#########.##.......##..........##........##.....##.......##....##..........##
.##....##..##..........##.......##.....##.##.......##..........##........##.....##.##....##....##....##....##
..######...########....##.......##.....##.########.########....##.........#######...######.....##.....######.
*/
module.exports.getAllPosts = (event, context, callback) => {
  return db.scan({
    TableName: postsTable
  }).promise().then(res => {

    callback(null, response(200, res.Items.sort(sortByDate)))

  }).catch(err => callback(null, response(err.statusCode, err)))
}

/*
..######...########.########....##....##.##.....##.##.....##.########..########.########......#######..########....########...#######...######..########..######.
.##....##..##..........##.......###...##.##.....##.###...###.##.....##.##.......##.....##....##.....##.##..........##.....##.##.....##.##....##....##....##....##
.##........##..........##.......####..##.##.....##.####.####.##.....##.##.......##.....##....##.....##.##..........##.....##.##.....##.##..........##....##......
.##...####.######......##.......##.##.##.##.....##.##.###.##.########..######...########.....##.....##.######......########..##.....##..######.....##.....######.
.##....##..##..........##.......##..####.##.....##.##.....##.##.....##.##.......##...##......##.....##.##..........##........##.....##.......##....##..........##
.##....##..##..........##.......##...###.##.....##.##.....##.##.....##.##.......##....##.....##.....##.##..........##........##.....##.##....##....##....##....##
..######...########....##.......##....##..#######..##.....##.########..########.##.....##.....#######..##..........##.........#######...######.....##.....######.
*/

module.exports.getPosts = (event, context, callback) => {
  const numberOfPosts = event.pathParameters.number
  const params = {
    TableName: postsTable,
    Limit: numberOfPosts
  }
  return db.scan(params).promise().then(res => {
    callback(null, response(200, res.Items.sort(sortByDate)))
  }).catch(err => callback(null, response(err.statusCode, err)))
}


/*
..######...########.########.....######..####.##....##..######...##.......########....########...#######...######..########
.##....##..##..........##.......##....##..##..###...##.##....##..##.......##..........##.....##.##.....##.##....##....##...
.##........##..........##.......##........##..####..##.##........##.......##..........##.....##.##.....##.##..........##...
.##...####.######......##........######...##..##.##.##.##...####.##.......######......########..##.....##..######.....##...
.##....##..##..........##.............##..##..##..####.##....##..##.......##..........##........##.....##.......##....##...
.##....##..##..........##.......##....##..##..##...###.##....##..##.......##..........##........##.....##.##....##....##...
..######...########....##........######..####.##....##..######...########.########....##.........#######...######.....##...
*/
module.exports.getPost = (event, context, callback) => {
  const id = event.pathParameters.id;

  const params = {
    Key: {
      id: id
    },
    TableName: postsTable
  }
  return db.get(params).promise().then(res => {

    if (res.Item) callback(null, response(200, res.Item))
    // { error: 'Post Not Found' }
    else callback(null, response(404, res))
  })
    .catch(err => callback(null, response(err.statusCode, err)))
}


/*
.##.....##.########..########.....###....########.########.......###.......########...#######...######..########
.##.....##.##.....##.##.....##...##.##......##....##............##.##......##.....##.##.....##.##....##....##...
.##.....##.##.....##.##.....##..##...##.....##....##...........##...##.....##.....##.##.....##.##..........##...
.##.....##.########..##.....##.##.....##....##....######......##.....##....########..##.....##..######.....##...
.##.....##.##........##.....##.#########....##....##..........#########....##........##.....##.......##....##...
.##.....##.##........##.....##.##.....##....##....##..........##.....##....##........##.....##.##....##....##...
..#######..##........########..##.....##....##....########....##.....##....##.........#######...######.....##...
*/

module.exports.updatePost = (event, context, callback) => {
  const id = event.pathParameters.id
  const body = JSON.parse(event.body)
  const theBody = body.body
  const title = body.title
  const params = {
    Key: {
      id: id
    },
    TableName: postsTable,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'set body = :b, title=:t',
    ExpressionAttributeValues: {
      ':b': theBody,
      ":t": title
    },
    ReturnValue: "UPDATED_NEW"
  }
  return db.update(params)
    .promise()
    .then(res => {
      callback(null, response(200, body))
    }).catch(err => callback(null, response(err.statusCode, err)))
}

/*
.########..########.##.......########.########.########....########...#######...######..########
.##.....##.##.......##.......##..........##....##..........##.....##.##.....##.##....##....##...
.##.....##.##.......##.......##..........##....##..........##.....##.##.....##.##..........##...
.##.....##.######...##.......######......##....######......########..##.....##..######.....##...
.##.....##.##.......##.......##..........##....##..........##........##.....##.......##....##...
.##.....##.##.......##.......##..........##....##..........##........##.....##.##....##....##...
.########..########.########.########....##....########....##.........#######...######.....##...
*/

module.exports.deletePost = (event, context, callback) => {
  const id = event.pathParameters.id
  const params = {
    Key: {
      id: id
    },
    TableName: postsTable
  }
  return db.delete(params)
    .promise()
    .then(() => callback(null, response(200, { message: 'Post deleted successfully' })))
    .catch(err => callback(null, response(err.statusCode, err)))
}

// async event => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };



/*
..######...######.....###....##....##
.##....##.##....##...##.##...###...##
.##.......##........##...##..####..##
..######..##.......##.....##.##.##.##
.......##.##.......#########.##..####
.##....##.##....##.##.....##.##...###
..######...######..##.....##.##....##
*/
// module.exports.getPost = (event, context, callback) => {
//   const id = event.pathParameters.id;

//   // const params = {
//   //   Key: {
//   //     id: id
//   //   },
//   //   TableName: postsTable
//   // }
//   var params = {
//     TableName: postsTable,
//     ProjectionExpression: "title",
//     FilterExpression: "title between :letter1 and :letter2",
//     // ExpressionAttributeNames: {
//     //   "#yr": "year"
//     // },
//     ExpressionAttributeValues: {
//       // ":yyyy": 1992,
//       ":letter1": "5",
//       ":letter2": "7"
//     }
//   };
//   return db.scan(params).promise().then(res => {

//     if (res.Item) callback(null, response(200, res.Item))
//     // { error: 'Post Not Found' }
//     else callback(null, response(404, res))
//   })
//     .catch(err => callback(null, response(err.statusCode, err)))
// }