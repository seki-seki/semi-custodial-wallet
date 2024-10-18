#!/bin/bash

# スクリプトが引数を受け取ることを確認
if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <bucket-name> <resource> <region>"
  exit 1
fi

# 引数を変数に格納
BUCKET_NAME=$1
RESOURCE=$2
REGION=$3

# S3バケットを作成
aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"

# 成功メッセージ
if [ $? -eq 0 ]; then
  echo "Bucket '$BUCKET_NAME' created successfully."
  BUCKET_ARN="arn:aws:s3:::$BUCKET_NAME"
  # アクセスポリシーを動的に生成
  POLICY=$(
    cat <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Principal": {
				"AWS": "${RESOURCE}"
			},
			"Action": "s3:*",
			"Resource": ["${BUCKET_ARN}/*"]
		}
	]
}
EOF
  )
  # アクセスポリシーをバケットに設定
  aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "$POLICY"

  # 成功メッセージ
  if [ $? -eq 0 ]; then
    echo "Policy applied to bucket '$BUCKET_NAME' successfully."
  else
    echo "Failed to apply policy to bucket '$BUCKET_NAME'."
  fi
else
  echo "Failed to create bucket '$BUCKET_NAME'."
fi
