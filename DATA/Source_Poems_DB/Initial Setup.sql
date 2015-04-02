create table DP.SOURCE_POEMS(
	PID Int,
    Title VARCHAR(100),
    Poem VARCHAR(20000),
    Other VARCHAR(100)
);

LOAD DATA LOCAL INFILE '/home/sanil/Documents/DP/Database/outfile.txt'
INTO TABLE DP.SOURCE_POEMS
CHARACTER SET UTF8
FIELDS TERMINATED BY '#' 
LINES TERMINATED BY '$'
(Title, PID, Poem);

SELECT COUNT(*) FROM DP.SOURCE_POEMS;

SELECT * FROM DP.SOURCE_POEMS;

--SELECT * FROM DP.SOURCE_POEMS WHERE PID = 230;
--TRUNCATE DP.SOURCE_POEMS;
--DROP TABLE DP.SOURCE_POEMS;