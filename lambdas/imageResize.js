'use strict';
const sharp = require('sharp');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const Bucket = 'salading-images';
const transforms = [{ name: 'w_200', width: 200 }, { name: 'w_400', width: 400 }, { name: 'w_600', width: 600 }];
const transformsDetail = [{ name: 'w_500', width: 500 }, { name: 'w_900', width: 900 }];
const transformsCommerceMain = [{ name: 'w_600', width: 600 }, { name: 'w_1600', width: 1600 }];

module.exports.products = async (event, context, callback) => {
  const key = event.Records[0].s3.object.key;
  const sanitizedKey = key.replace(/\+/g, ' ');
  const parts = sanitizedKey.split('/');
  const filename = parts[parts.length - 1];
  console.log(`===== Image Resize Start, ID: ${key}`)
  try {
    const image = await s3.getObject({ Bucket, Key: sanitizedKey }).promise();
    if (parts[0] === 'product_detail')
      await Promise.all(
        transformsDetail.map(async item => {
          try {
            let Key = `${parts[0]}/${item.name}/${filename}`;
            const resizedImg = await sharp(image.Body)
              .resize({ width: item.width })
              .toBuffer();
            return await s3
              .putObject({
                Bucket,
                Body: resizedImg,
                Key
              })
              .promise();
          } catch (err) {
            throw err;
          }
        })
      );
    else if (parts[0] === 'commerce_main' || parts[0] === 'commerce_banner')
      await Promise.all(
        transformsCommerceMain.map(async item => {
          try {
            let Key = `${parts[0]}/${item.name}/${filename}`;
            const resizedImg = await sharp(image.Body)
              .resize({ width: item.width })
              .toBuffer();
            return await s3
              .putObject({
                Bucket,
                Body: resizedImg,
                Key
              })
              .promise();
          } catch (err) {
            throw err;
          }
        })
      );
    else
      await Promise.all(
        transforms.map(async item => {
          try {
            let Key = `${parts[0]}/${item.name}/${filename}`;
            const resizedImg = await sharp(image.Body)
              .resize({ width: item.width })
              .toBuffer();
            return await s3
              .putObject({
                Bucket,
                Body: resizedImg,
                Key
              })
              .promise();
          } catch (err) {
            throw err;
          }
        })
      );
    callback(null, `Success: ${filename}`);
  } catch (err) {
    callback(`Error resizing files: ${err}`);
  }
};
