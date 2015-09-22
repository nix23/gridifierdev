Dom.init();
SizesResolver.init();

var gridifier = this;
var core = new Core();
var srManager = new SizesResolverManager();
var gridItem = new Item();
// create grid
var event = new EventEmitter();
var settings = new Settings();
var collector = new Collector();
var guid = new GUID();

// Kogda sozdaew appender/preender etc.. If no setting matches throw Error