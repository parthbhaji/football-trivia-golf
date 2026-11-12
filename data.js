// Football Trivia Golf — leaderboard data.
// Career totals through the 2025 NFL regular season, compiled from memory.
// Each list is ordered rank 1..N. To add a category, append an object below.
window.TG_DATA = {
  asOf: "through the 2025 season",
  categories: [
    {
      id: "rush_yds", label: "career rushing yards",
      players: ["Emmitt Smith","Walter Payton","Frank Gore","Barry Sanders","Adrian Peterson",
        "Curtis Martin","LaDainian Tomlinson","Jerome Bettis","Eric Dickerson","Derrick Henry",
        "Tony Dorsett","Jim Brown","Marshall Faulk","Edgerrin James","Marcus Allen",
        "Franco Harris","Thurman Thomas","Fred Taylor","Steven Jackson","John Riggins",
        "Corey Dillon","O.J. Simpson","LeSean McCoy","Warrick Dunn","Ricky Watters",
        "Jamal Lewis","Thomas Jones","Tiki Barber","Eddie George","Marshawn Lynch",
        "Ottis Anderson","Ricky Williams","Clinton Portis","Matt Forte","Joe Perry",
        "Chris Johnson","Shaun Alexander","Earl Campbell","Ahman Green","Ezekiel Elliott"]
    },
    {
      id: "pass_yds", label: "career passing yards",
      players: ["Tom Brady","Drew Brees","Peyton Manning","Brett Favre","Aaron Rodgers",
        "Matthew Stafford","Ben Roethlisberger","Philip Rivers","Matt Ryan","Dan Marino",
        "Eli Manning","John Elway","Warren Moon","Russell Wilson","Fran Tarkenton",
        "Kirk Cousins","Carson Palmer","Vinny Testaverde","Drew Bledsoe","Dan Fouts"]
    },
    {
      id: "pass_td", label: "career passing touchdowns",
      players: ["Tom Brady","Drew Brees","Peyton Manning","Aaron Rodgers","Brett Favre",
        "Matthew Stafford","Philip Rivers","Dan Marino","Ben Roethlisberger","Matt Ryan",
        "Eli Manning","Russell Wilson","Fran Tarkenton","Kirk Cousins","John Elway",
        "Carson Palmer","Warren Moon","Johnny Unitas","Derek Carr","Vinny Testaverde",
        "Joe Montana","Patrick Mahomes","Dak Prescott","Dave Krieg","Sonny Jurgensen",
        "Dan Fouts","Drew Bledsoe","Joe Flacco","Boomer Esiason"]
    },
    {
      id: "rec_yds", label: "career receiving yards",
      players: ["Jerry Rice","Larry Fitzgerald","Terrell Owens","Randy Moss","Isaac Bruce",
        "Tony Gonzalez","Tim Brown","Steve Smith Sr.","Marvin Harrison","Reggie Wayne",
        "Andre Johnson","James Lofton","Cris Carter","Anquan Boldin","Henry Ellard",
        "Julio Jones","Torry Holt","Andre Reed","Steve Largent","Jason Witten",
        "Mike Evans","Travis Kelce","Irving Fryar","Art Monk","Brandon Marshall"]
    },
    {
      id: "rush_td", label: "career rushing touchdowns",
      players: ["Emmitt Smith","LaDainian Tomlinson","Marcus Allen","Derrick Henry","Adrian Peterson",
        "Walter Payton","Jim Brown","John Riggins","Marshall Faulk","Shaun Alexander",
        "Barry Sanders","Franco Harris","Jerome Bettis","Curtis Martin","Eric Dickerson",
        "Priest Holmes","Marshawn Lynch","Jim Taylor","Corey Dillon","Frank Gore",
        "Edgerrin James","Josh Allen","Ricky Watters","Tony Dorsett"]
    },
    {
      id: "sacks", label: "career sacks (official, since 1982)",
      players: ["Bruce Smith","Reggie White","Kevin Greene","Julius Peppers","Chris Doleman",
        "Michael Strahan","Jason Taylor","Terrell Suggs","DeMarcus Ware","Von Miller",
        "Richard Dent","John Randle","Jared Allen","John Abraham","Leslie O'Neal",
        "Lawrence Taylor","Cameron Jordan","Rickey Jackson","Derrick Thomas","Myles Garrett",
        "Dwight Freeney","Robert Mathis","Simeon Rice","Clyde Simmons","J.J. Watt",
        "Sean Jones","Chandler Jones","Aaron Donald","Greg Townsend"]
    }
  ],
  // Alternate spellings people might type -> canonical name
  aliases: {
    "steve smith": "Steve Smith Sr.", "lt": "Lawrence Taylor", "ladainian": "LaDainian Tomlinson",
    "oj simpson": "O.J. Simpson", "jj watt": "J.J. Watt", "zeke": "Ezekiel Elliott",
    "zeke elliott": "Ezekiel Elliott", "beast mode": "Marshawn Lynch", "big ben": "Ben Roethlisberger",
    "megatron": "Calvin Johnson", "shady mccoy": "LeSean McCoy", "t.o.": "Terrell Owens", "to": "Terrell Owens"
  },
  // Extra names offered in autocomplete (decoys / plausible guesses not on every list)
  extras: ["Calvin Johnson","Michael Irvin","Hines Ward","Antonio Brown","DeAndre Hopkins","Davante Adams",
    "Tyreek Hill","Keenan Allen","Jimmy Smith","Derrick Mason","Wes Welker","Saquon Barkley","Nick Chubb",
    "Christian McCaffrey","Alvin Kamara","Joe Mixon","Josh Jacobs","Mark Ingram","Michael Turner",
    "Jim Kelly","Troy Aikman","Steve Young","Kerry Collins","Andy Dalton","Jared Goff","Lamar Jackson",
    "Joe Burrow","Justin Herbert","Cam Newton","Donovan McNabb","T.J. Watt","Khalil Mack","Deacon Jones",
    "Charles Haley","Howie Long","Dwight Freeney","Ray Lewis","Joe Namath","Terry Bradshaw","Roger Staubach"]
};
