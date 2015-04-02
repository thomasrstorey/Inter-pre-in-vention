#include <fstream>
#include <iostream>
#include <cstring>
#include <stdlib.h>

using namespace std;

/*
	THE ORIGINAL PDF TEXT (EmilyDickinsonPoems_PDF_Text.txt)
	WAS PRE-PROCESSED USING REG-EX:
		* OCCURRENCES OF 
			Emily Dickinson
		    www.PoemHunter.com - The World's Poetry Archive
		  WERE REPLACED BY $
		* NOW,ANYTHING FOLLOWED BY A $ WAS THE PAGE NUMBER WHICH WAS OF NO USE.
		  REMOVE ALL SUCH OCCURRENCES.
		* OUTPUT WAS STORED IN EmilyDickinsonPoems.txt

	INPUT FORMAT (EmilyDickinsonPoems.txt):
		$TITLE
		[NUMBER]
		POEM TEXT

	OUTPUT FORMAT:
		TITLE#[NUMBER]#POEM TEXT
	where # is any delimiter.

 	COLUMN DELIMITER: #
 	LINE DELIMITER: $

	IF WE LOAD THIS FILE DIRECTLY, WE GET A NULL ROW DUE TO THE PRESENCE OF THE FIRST $
	REMOVE THIS $ BEFORE LOADING THE FILE INTO THE DATABASE

 	TO LOAD THIS FILE INTO MySQL, WE NEED TO RUN THE FOLLOWING QUERY:
 		LOAD DATA LOCAL INFILE '/home/sanil/Documents/DP/Database/outfile.txt'
		INTO TABLE DP.SOURCE_POEMS
		CHARACTER SET UTF8
		FIELDS TERMINATED BY '#' 
		LINES TERMINATED BY '$'
		(Title, PID, Poem);
*/

int main() {
	ifstream infile("EmilyDickinsonPoems.txt");
	ofstream outfile("outfile.txt");

	int count, i;
	char* title = (char*)malloc(100);
	char *poem = (char*)malloc(8000);;
	bool PIDPresent;
	char* out = (char*)malloc(10000);

	string num;
	std::string line;
	count = 0;
	while (std::getline(infile, line))
	{
		// EACH POEM SNIPPET STARTS WITH A $ FOLLOWED BY THE TITLE
		num = "";
		title = "";
		i = 0;

		// IF THE FIRST CHARACTER IS $, IT WILL BE FOLLOWED BY A TITLE
		if (line.at(0) == '$') {
			outfile << line << "#";
			PIDPresent = false;
			continue;
		}

		// IF TITLE HAS ALREADY BEEN WRITTEN, THE NEXT LINE IS THE PID
		// IF THIS PID IS MISSING, THEN IT WILL BE THE POEM TEXT

		// IF THE NEXT LINE IS THE PID
		else if (isdigit(line.at(0))) {
				outfile << line << "#";
				PIDPresent = true;
		}

		/*
			* IF THE PID WAS PRESENT, THE NEXT LINE IS THE POEM TEXT
			* IF THE PID WAS NOT PRESENT, THE CURRENT LINE IS THE POEM TEXT. SO OUTPUT 
				A NULL FOR THE PID FOLLOWED BY THE POEM TEXT
		*/
		else if (PIDPresent)
			outfile << line << endl;
		else {
			outfile << "#" << line << endl;
			PIDPresent = true;
		}
	}

	infile.close();
	outfile.close();
	return 0;
}