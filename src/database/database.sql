-- PostgreSQL 12.1
DROP TABLE IF EXISTS VIEWED_EPISODES;
DROP TABLE IF EXISTS VIEWED_MOVIES;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS MOVIES;
DROP TABLE IF EXISTS EPISODES;
DROP TABLE IF EXISTS SERIES;
DROP TYPE IF EXISTS language;

DROP TABLE IF EXISTS EPISODE_TIMESTAMPS;
DROP TYPE IF EXISTS ActionType;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS USERS(
  ID SERIAL PRIMARY KEY,
  USERNAME VARCHAR(20) UNIQUE
);

-- -----------------------------------------------------------------------------
-- TV SHOW
-- -----------------------------------------------------------------------------
CREATE TYPE language AS ENUM ('en', 'ru');

CREATE TABLE SERIES(
  ID SERIAL PRIMARY KEY,
  LANGUAGE language NOT NULL DEFAULT 'en',
  FOLDER VARCHAR(200) NOT NULL, -- Should this be unique?
  TITLE VARCHAR(50) NOT NULL,
  
  SEASONS INT,
  DESCRIPTION VARCHAR(400),
  POSTER VARCHAR(200),

  DISPLAY BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS EPISODES(
    ID SERIAL PRIMARY KEY, 
    SERIES_ID INT NOT NULL,
    SEASON_NUMBER INT NOT NULL,
    EPISODE_NUMBER INT NOT NULL,
    VIDEO_URL VARCHAR(200) NOT NULL,
    DURATION INT NOT NULL,

    THUMBNAIL_URL VARCHAR(200),
    TITLE VARCHAR(100),
    PLOT VARCHAR(400),

    CONSTRAINT unique_episode_in_season UNIQUE (SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER),
    FOREIGN KEY (SERIES_ID) REFERENCES SERIES(ID) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- VIEWED
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS VIEWED_EPISODES(
  EPISODE_ID INT NOT NULL,
  USER_ID INT NOT NULL,

  STOPPED_AT INT NOT NULL, -- between 0 and the duration of the episode
  DATE_VIEWED TIMESTAMP NOT NULL UNIQUE, -- date last viewed
  DATE_PLAYED TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- first time played

  CONSTRAINT ID PRIMARY KEY (EPISODE_ID, USER_ID),
  FOREIGN KEY (EPISODE_ID) REFERENCES EPISODES(ID) ON DELETE CASCADE,
  FOREIGN KEY (USER_ID) REFERENCES USERS(ID)
);

CREATE TABLE VIEWED_MOVIES(
  MOVIE_ID INT NOT NULL,
  USER_ID INT NOT NULL,

  STOPPED_AT INT NOT NULL,
  DATE_VIEWED TIMESTAMP NOT NULL UNIQUE, -- date last viewed, TODO: this should not be unique!
  DATE_PLAYED TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- first time played

  CONSTRAINT VM_ID PRIMARY KEY (MOVIE_ID, USER_ID),
  FOREIGN KEY (MOVIE_ID) REFERENCES MOVIES(ID) ON DELETE CASCADE,
  FOREIGN KEY (USER_ID) REFERENCES USERS(ID)
);

-- INSERT INTO VIEWED_MOVIES(MOVIE_ID, USER_ID, STOPPED_AT, DATE_VIEWED) VALUES (2, 1, 540, TIMESTAMP '12-30-2019 11:47:05');

-- -----------------------------------------------------------------------------
-- MOVIES
-- -----------------------------------------------------------------------------
CREATE TABLE MOVIES(
  ID SERIAL PRIMARY KEY,
  LANGUAGE language NOT NULL DEFAULT 'en',
  DURATION INT NOT NULL,
  VIDEO_URL VARCHAR(200) NOT NULL,
  FOLDER VARCHAR(200) NOT NULL,
  TITLE VARCHAR(50) NOT NULL, -- get from IMDB, default to folder name

  DESCRIPTION VARCHAR(400),
  POSTER VARCHAR(200)
);

-- -----------------------------------------------------------------------------
-- VIDEO INFO
-- -----------------------------------------------------------------------------
CREATE TYPE ActionType AS ENUM ('skip', 'nextEpisode');

  -- {"name":"Skip intro","action":{"type":"skip","to":30,"from":120}}
  -- {"name":"Next episode","action":{"type":"nextEpisode","from":1230}}

CREATE TABLE EPISODE_TIMESTAMPS(
  ID SERIAL PRIMARY KEY,
  EPISODE_ID INT NOT NULL,
  NAME VARCHAR(200) NOT NULL,
  TYPE ActionType NOT NULL,
  FROM_TIME INT NOT NULL, -- corresponds to `from`
  TO_TIME INT, -- corresponds to `to`

  FOREIGN KEY (EPISODE_ID) REFERENCES EPISODES(ID) ON DELETE CASCADE
)