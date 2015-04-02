*** This file contains the following structure of data files stored under it ***

--/data/
--------/original_poems_index.json
--------/poem_uid.json (* 1 json file per poem including the ones generated)
--------/user_stats.json (* file which might contain user info/statistics for the application)

***** Structure of the poem_uid json file *****

{
   "pid"      : <unique poem ID>
   "title"    : <title of the poem>
   "text"     : <poem text>
   "child"    : [ {"pid": <pid of neighbor poem>, "dist": <Levenshtein's (edit) distance> },
                  {"pid": <pid of neighbor poem>, "dist": <Levenshtein's (edit) distance> },
                  ...
                  ...
                  {"pid": <pid of neighbor poem>, "dist": <Levenshtein's (edit) distance> }
                ]
   "orig_src" : <pid of the original source poem from which this poem was derived>
   "poem_num" : <the poem number present in the Emily Dickinson poems collection>
}

***** Structure of the orginal_poems_index.json file *****

{
	"poem_num" : <the poem number present in the Emily Dickinson poems collection>
	"pid"      : <the randomly generated unique Poem ID>
}

