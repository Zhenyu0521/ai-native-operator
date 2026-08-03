# News Sync Architecture

## Current Website Contract

The homepage reads `data/news.json` and renders the Explore / News panel from that file.

Expected schema:

```json
{
  "updatedAt": "2026-07-10",
  "workflow": "follow-builders",
  "groups": [
    {
      "title": "AI Builders Digest",
      "date": "2026-07-10",
      "source": "follow-builders",
      "source_url": "https://github.com/zarazhangrui/follow-builders",
      "stats": {
        "podcastEpisodes": 1,
        "xBuilders": 20,
        "totalTweets": 40,
        "blogPosts": 3,
        "feedGeneratedAt": "2026-07-09T07:28:29.483Z"
      },
      "sections": {
        "x_twitter": [],
        "official_blogs": [],
        "podcasts": []
      },
      "errors": []
    }
  ]
}
```

The homepage renders up to seven date groups. Groups are sorted newest first. The latest date is expanded by default, and older date groups are collapsed below it as an archive.

## Follow Builders Skill Integration

The shared skill at `https://github.com/zarazhangrui/follow-builders/blob/main/SKILL.md` appears to produce a richer daily builder digest rather than a website-ready news list. The recommended integration is:

1. Run the skill on a daily GitHub Actions schedule.
2. Save the skill's raw digest output as an artifact or temporary JSON file.
3. Wrap that raw digest into the date-grouped website schema above.
4. Commit the updated `data/news.json` back to this website repository.

## Information Needed From The User

To connect the automation, we need one of these:

1. A sample raw JSON output from the skill's daily run.
2. Confirmation that the website repository and the skill repository can be the same repository, or the target GitHub repository URL if they are separate.
3. The preferred daily sync time and timezone.
4. The ranking rule for homepage items: latest first, manually selected top five, or highest-scoring signals from the skill output.

The target GitHub repository means the repository that stores this website's source code and receives the daily `data/news.json` updates.
