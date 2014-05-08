
-- create the flowsim database
CREATE DATABASE flowsim;

-- connect to the flowsim database
\c flowsim;

-- create an enumerated type for the account status
CREATE TYPE SUBSCRIBER_STATUS AS ENUM (
  'REGISTERED',   -- a sub has registered but not confirmed they own their email
  'VERIFIED'     -- a sub has confirmed they own their email
);

-- create the primary subscriber table
CREATE TABLE subscriber
(
  id SERIAL PRIMARY KEY,                          -- internal id uses for sub
  email VARCHAR(128) NOT NULL UNIQUE,             -- email owned by sub
  password CHAR(60) NOT NULL,                     -- hashed pwd of sub
  reg_date TIMESTAMP WITH TIME ZONE NOT NULL,     -- date/time of registration
  reg_ip INET NOT NULL,                           -- ip used for registration
  status SUBSCRIBER_STATUS NOT NULL,              -- current sub disposition
  status_date TIMESTAMP WITH TIME ZONE NOT NULL,  -- date of last change in disp
  reg_key CHAR(128) NOT NULL                       -- verification key
);

-- create an enumerated type for the session status
CREATE TYPE SESSION_STATUS AS ENUM (
  'ACTIVE',       -- a session is currently active
  'TIMEDOUT',     -- a session ended by timing out
  'LOGGEDOUT'     -- a session ended by explicit logout
);

-- create a session table
CREATE TABLE session
(
  id SERIAL PRIMARY KEY,                              -- internal sesison id
  sub_id INTEGER references subscriber(id) NOT NULL,  -- reference to sub
  key CHAR(128) NOT NULL UNIQUE,                       -- session key for API
  begin_time TIMESTAMP NOT NULL,                      -- date/time session began
  end_time TIMESTAMP NOT NULL,                        -- date/time session ended
  ip INET NOT NULL,                                   -- ip used for session
  status SESSION_STATUS NOT NULL                      -- current session status
);

