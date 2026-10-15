# One-time AWS + GitHub setup (about 10 minutes)

You do this once. After it, every push to `main` deploys the site by itself.
You never give anyone your AWS keys: GitHub gets short-lived access through a role (OIDC).

## Before you start

- The code is on GitHub in a **public** repo named `portfolio-website`. Public repos get free Actions minutes.
- You can sign in to the AWS Console.
- Note: AWS accounts made after July 15, 2025 on the **Free plan** close after 6 months or when the credits run out. If you want the site to stay up, switch to the **Paid plan**. The site still costs $0 within the always-free limits, and the budget alert below warns you early.

## Step 1 — Create the deploy role, state bucket and budget (AWS CloudShell)

1. In the AWS Console, pick your region at the top right, for example **Canada (Central) ca-central-1**.
2. Open **CloudShell**: the `>_` icon at the top of the console.
3. Click **Actions → Upload file** and upload `infra/bootstrap/bootstrap.yaml` from this folder.
4. Paste this, after changing the two values in CAPS:

```bash
aws cloudformation deploy \
  --template-file bootstrap.yaml \
  --stack-name portfolio-website-bootstrap \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOwner=YOUR_GITHUB_USERNAME BudgetEmail=YOUR_EMAIL
```

5. When it says `Successfully created/updated stack`, print the values you need:

```bash
aws cloudformation describe-stacks --stack-name portfolio-website-bootstrap \
  --query "Stacks[0].Outputs" --output table
```

> Error "Provider with url https://token.actions.githubusercontent.com already exists", or
> `AWS::EarlyValidation::ResourceExistenceCheck`?
> Your account already has the GitHub provider. Add
> `ExistingOIDCProviderArn=arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com`
> to `--parameter-overrides` and run it again.

> `GitHubOwner` must match your GitHub username exactly, including capital letters.

> Deploy fails with "Not authorized to perform sts:AssumeRoleWithWebIdentity"?
> Your repo may use GitHub's immutable OIDC subject. Run
> `gh api repos/<OWNER>/portfolio-website/actions/oidc/customization/sub`. If it shows
> `"use_immutable_subject":true`, add `GitHubSubjectPrefix=<the sub_claim_prefix value>` to
> `--parameter-overrides` and run the deploy command again.

## Step 2 — Tell GitHub where to deploy

In the repo on GitHub: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**.

| Name              | Value (from Step 1 output)           |
| ----------------- | ------------------------------------ |
| `AWS_ROLE_ARN`    | `DeployRoleArn`                      |
| `TF_STATE_BUCKET` | `StateBucketName`                    |
| `AWS_REGION`      | `Region`, for example `ca-central-1` |

These are not secrets, so they go under Variables. The role only trusts this one repository.

## Step 3 — Add an approval step before prod

**Settings → Environments**:

1. **New environment** → `dev` → **Configure environment** (no rules needed).
2. **New environment** → `prod` → tick **Required reviewers**, add yourself → **Save protection rules**.

## Step 4 — Deploy

**Actions → CI/CD → Run workflow** (or push any change to `main`).

1. The tests run, then **dev** deploys. The first deploy takes 5–10 minutes because CloudFront is being created.
2. The run pauses at **prod**. Click **Review deployments → Approve**.
3. Each deploy job prints the site address in its summary, for example `https://d1abc234xyz.cloudfront.net`.

## Step 5 — Finishing touches

- Add the prod URL as the repository variable `SITE_URL` so link previews use it.
- Paste the URL into `README.md` (**Live:**) and set `sourceUrl` in `src/content/profile.ts` to your repo link.

## Later: a custom domain

Buy a domain (for example in Route 53), request a free certificate in **ACM (us-east-1)**, then add `aliases` and
`viewer_certificate { acm_certificate_arn = ... }` to `infra/modules/static-site/main.tf`. Ask Claude Code to
"add my custom domain to the portfolio" and give it the domain name.
