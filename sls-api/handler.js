'use strict';
const aws = require('aws-sdk')
const db = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
const uuid = require('uuid/v4')

const postsTable = process.env.POSTS_TABLE

function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  }
}

module.exports.createPost = (event, context, callback) => {
  const reqBody = JSON.parse(event.body)

  const post = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body
  }

  return db.put({
    TableName: postsTable,
    Item: post
  }).promise().then(() => {
    callback(null, response(201, post))
  }).catch(err => response(null, response(err.statusCode, err)))
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
