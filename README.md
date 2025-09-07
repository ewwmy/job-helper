# Job Helper MVP

This project is a CLI utility made to provide statistics of your job applications.

It uses a local SQLite database to store:
- Jobs (+blacklist)
- Companies (+blacklist)
- Contacts (+blacklist)
- Interviews.

It's supposed that you know SQL and will use it to do your research.

## Installation

```bash
mkdir job-helper
cd job-helper
git clone https://github.com/ewwmy/job-helper.git .
npm i -g .
cp .env.example .env # make sure to set up proper paths in your .env file
job-helper-migrate up all confirm
```

Now you can use it.

Try to run it without arguments to get some help:

```bash
job-helper
```

## Uninstallation

```bash
npm uninstall -g @ewwmy/job-helper
```

## Usage

### Main features

- Parse job descriptions.
- Parse company descriptions.
- Collect job statistics.

> Now it only works with `hh.ru` but can be easily extended to other job boards by setting new XPath rules and some additional parsing logic.

### Help

```bash
job-helper
```

### Collect job statistics

```bash
job-helper stat
```

> It can take a while.
> You can set up `DELAY` (in milliseconds) and `MAX_ATTEMPTS` in your `.env` file to make it run faster but be aware of rate limits of some websites.

It walks through preconfigured websites and job title lists to collect statistics of certain jobs. You can do it with cron to get it done periodically. Later you can use predefined `VIEW`s in your database to get detailed statistics and dynamics of job titles you're interested in.

### Parse job description

Parse and save a vacancy profile into the database:

```bash
job-helper vacancy "https://hh.ru/vacancy/123"
```

You can use flags `applied`, `draft` and `proposed` to set the status of the job. By default it's `draft`:

```bash
job-helper vacancy "https://hh.ru/vacancy/123" applied
```

If the job url is already in the database, it will update some fields from the website. Status will not be changed.

### Parse company description

Parse and save a company profile into the database:

```bash
job-helper company "https://hh.ru/employer/123"
```

### Parse job description plus its company

Parse and save a job profile into the database plus additionally its company profile:

```bash
job-helper vacancy+company "https://hh.ru/vacancy/123"
```

Flags `applied`, `draft` and `proposed` are supported here too:

```bash
job-helper vacancy+company "https://hh.ru/vacancy/123" applied
```
