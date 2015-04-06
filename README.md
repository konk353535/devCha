devCha is a predominently back-end project. It use's NodeJs and MongoDB to scan through Riot's developer challenge endpoint.

The endpoint returns a list of match id's which represent URF games. Using riots match v2.2 API it pulls data about each game, including the champions who played and which team was victorious.

Using this data it stores the win and loss count for each champion, allowing it to generate win % and play % for champions.