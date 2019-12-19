-- PostgreSQL 12.1
DROP TABLE IF EXISTS VIEWED_EPISODES;
DROP TABLE IF EXISTS VIEWED_MOVIES;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS MOVIES;
DROP TABLE IF EXISTS EPISODES;
DROP TABLE IF EXISTS SERIES;
DROP TYPE IF EXISTS language;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS USERS(
  ID SERIAL PRIMARY KEY,
  NAME VARCHAR(20)
);

-- -----------------------------------------------------------------------------
-- TV SHOW
-- -----------------------------------------------------------------------------
CREATE TYPE language AS ENUM ('en', 'ru');

CREATE TABLE SERIES(
  ID SERIAL PRIMARY KEY,
  LANGUAGE language NOT NULL DEFAULT 'en',
  FOLDER VARCHAR(30) NOT NULL,
  TITLE VARCHAR(50) NOT NULL,
  SEASONS INT NOT NULL,

  DESCRIPTION VARCHAR(250),
  POSTER VARCHAR(200),

  DISPLAY BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS EPISODES(
    ID SERIAL PRIMARY KEY, 
    SERIES_ID INT NOT NULL,
    EPISODE_NUMBER INT NOT NULL,
    SEASON_NUMBER INT NOT NULL,
    VIDEO_URL VARCHAR(200) NOT NULL,
    DURATION INT NOT NULL,

    THUMBNAIL_URL VARCHAR(200),
    TITLE VARCHAR(50),
    PLOT VARCHAR(250),

    CONSTRAINT unique_episode_in_season UNIQUE (ID, SEASON_NUMBER, EPISODE_NUMBER),
    FOREIGN KEY (SERIES_ID) REFERENCES SERIES(ID)
);

-- -----------------------------------------------------------------------------
-- VIEWED
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS VIEWED_EPISODES(
  EPISODE_ID INT NOT NULL,
  USER_ID INT NOT NULL,

  STOPPED_AT INT NOT NULL, -- between 0 and the duration of the episode
  DATE_PLAYED TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- first time played
  DATE_VIEWED TIMESTAMP NOT NULL, -- date last viewed

  CONSTRAINT ID PRIMARY KEY (EPISODE_ID, USER_ID),
  FOREIGN KEY (EPISODE_ID) REFERENCES EPISODES(ID),
  FOREIGN KEY (USER_ID) REFERENCES USERS(ID)
);