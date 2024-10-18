#!/bin/bash

# スクリプトが引数を受け取ることを確認
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <role-name> <bucket-name>"
  exit 1
fi

# 引数を変数に格納
ROLE_NAME=$1
BUCKET_NAME=$2

# ポリシーを動的に生成
POLICY=$(
  cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListYourObjects",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "users/\${cognito-identity.amazonaws.com:sub}/*"
                    ]
                }
            }
        },
        {
            "Sid": "ReadWriteDeleteYourObjects",
            "Effect": "Allow",
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME/users/\${cognito-identity.amazonaws.com:sub}/*"
            ]
        }
    ]
}
EOF
)

# ポリシーを一時的にJSONファイルに保存
POLICY_FILE=$(mktemp)
echo "$POLICY" >"$POLICY_FILE"

# ポリシーをロールにアタッチ
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name "S3AccessPolicy-$BUCKET_NAME" --policy-document file://"$POLICY_FILE"

# 成功メッセージ
if [ $? -eq 0 ]; then
  echo "Policy successfully attached to role '$ROLE_NAME'."
else
  echo "Failed to attach policy to role '$ROLE_NAME'."
fi

# 一時ファイルを削除
rm "$POLICY_FILE"
