# GitHub Secrets Setup Guide

## Overview
This guide explains how to configure GitHub secrets for staging and production deployments with different API URLs.

## Required GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

### AWS Credentials (Shared)
```
AWS_ACCESS_KEY_ID          = your-aws-access-key-id
AWS_SECRET_ACCESS_KEY      = your-aws-secret-access-key
AWS_REGION                 = us-east-1
```

### Staging Environment (stage branch)
```
STAGING_API_URL            = https://staging-api.vlifew.com
STAGING_BACKEND_API_URL    = https://staging-api.vlifew.com
```

### Production Environment (main/master branch)
```
PRODUCTION_API_URL         = https://vlifew.com
PRODUCTION_BACKEND_API_URL = https://vlifew.com
S3_PROD_BUCKET             = your-production-bucket-name
CLOUDFRONT_PROD_DISTRIBUTION_ID = your-production-cloudfront-id
```

## Deployment Workflows

### Staging Deployment
- **Branch:** `stage`
- **Bucket:** `vlife-web-stage-us-east-1` (hardcoded)
- **CloudFront:** `E24YKWCXYUQS6M` (hardcoded)
- **API URL:** Uses `STAGING_API_URL` secret
- **Triggers:** Push or PR merge to `stage` branch

### Production Deployment
- **Branch:** `main` or `master`
- **Bucket:** Uses `S3_PROD_BUCKET` secret
- **CloudFront:** Uses `CLOUDFRONT_PROD_DISTRIBUTION_ID` secret
- **API URL:** Uses `PRODUCTION_API_URL` secret
- **Triggers:** Push or PR merge to `main`/`master` branch

## Example API URL Configuration

### Option 1: Different Domains
```
Staging:    https://staging-api.vlifew.com
Production: https://api.vlifew.com
```

### Option 2: Same Domain, Different Subdomains
```
Staging:    https://staging.vlifew.com
Production: https://vlifew.com
```

### Option 3: Same Domain, Different Ports (EC2)
```
Staging:    http://3.225.93.41:3000
Production: https://vlifew.com
```

## How It Works

1. **Developer pushes to `stage` branch**
   - Workflow reads `STAGING_API_URL` from secrets
   - Builds app with staging API URL
   - Deploys to staging S3 bucket
   - Invalidates staging CloudFront

2. **Developer pushes to `main` branch**
   - Workflow reads `PRODUCTION_API_URL` from secrets
   - Builds app with production API URL
   - Deploys to production S3 bucket
   - Invalidates production CloudFront

## Testing

### Test Staging Deployment
```bash
git checkout stage
git add .
git commit -m "Test staging deployment"
git push origin stage
```

### Test Production Deployment
```bash
git checkout main
git merge stage
git push origin main
```

## Troubleshooting

### Build uses wrong API URL
- Check that secrets are named correctly (case-sensitive)
- Verify secrets are set in GitHub repository settings
- Check workflow file uses correct secret names

### Deployment fails
- Verify AWS credentials have S3 and CloudFront permissions
- Check bucket name and CloudFront distribution ID are correct
- Ensure AWS region is correct

### CloudFront still shows old content
- Invalidation takes 1-5 minutes to complete
- Check invalidation was created successfully in AWS Console
- Try hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)

## Security Best Practices

1. **Never commit secrets to code**
2. **Use different AWS credentials for staging/production** (recommended)
3. **Rotate AWS keys regularly**
4. **Use IAM roles with minimal permissions**
5. **Enable MFA on AWS account**

## Minimal IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::vlife-web-stage-us-east-1/*",
        "arn:aws:s3:::vlife-web-stage-us-east-1",
        "arn:aws:s3:::your-production-bucket/*",
        "arn:aws:s3:::your-production-bucket"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": [
        "arn:aws:cloudfront::*:distribution/E24YKWCXYUQS6M",
        "arn:aws:cloudfront::*:distribution/YOUR_PROD_DISTRIBUTION_ID"
      ]
    }
  ]
}
```
