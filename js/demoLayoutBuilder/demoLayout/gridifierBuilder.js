DemoLayoutBuilder.GridifierBuilder = function(sgrid, ssettings) {
    sourceGrid = sgrid;
    sourceSettings = ssettings;

    Dom.init();
    SizesResolver.init();

    gridifier = this;
    srManager = new SizesResolverManager();
    gridItem = new Item();
    grid = new Grid();
    ev = new EventEmitter();
    settings = new Settings();
    core = new Core();

    eq = bind("eq", settings);

    collector = new Collector();
    guid = new GUID();
    antialiaser = new Antialiaser();
    rounder = new Rounder();
    operation = new Operation();
    imagesLoader = new ImagesLoader();

    connectors = new Connectors();
    crsCleaner = new CrsCleaner();
    crsIntersector = new CrsIntersector();
    repositionCrs = new RepositionCrs();
    crsRounder = new CrsRounder();
    crsSelector = new CrsSelector();
    crsShifter = new CrsShifter();
    crsSorter = new CrsSorter();

    coordsFinder = (eq("grid", "vertical")) ? new VgCoordsFinder() : new HgCoordsFinder();
    connections = (eq("grid", "vertical")) ? new VgConnections() : new HgConnections();

     cnsCore = new CnsCore();
     cnsIntersector = new CnsIntersector();
     cnsRanges = new CnsRanges();
     cnsSorter = new CnsSorter();
     cnsXYIntersector = new CnsXYIntersector();

     cssManager = new CssManager();
     iterator = new Iterator();

     renderer = new Renderer();
     rendererCns = new RendererCns();
     rendererQueue = new RendererQueue();
     silentRenderer = new SilentRenderer();

     appender = (eq("grid", "vertical")) ? new VgAppender() : new HgAppender();
     prepender = (eq("grid", "vertical")) ? new VgPrepender() : new HgPrepender();
     reversedAppender = (eq("grid", "vertical")) ? new VgReversedAppender() : new HgReversedAppender();
     reversedPrepender = (eq("grid", "vertical")) ? new VgReversedPrepender() : new HgReversedPrepender();

     resorter = new Resorter();
     disconnector = new Disconnector();
     filtrator = new Filtrator();

     reposition = new Reposition();
     repositionQueue = new RepositionQueue();
     repositionData = new RepositionData();

     insertQueue = new InsertQueue();
     appendOp = new AppendOp();
     prependOp = new PrependOp();
     insertOp = new InsertOp();

     ccApi = new CcApi();
     rsortApi = new RsortApi();
     sortHelpers = new SortHelpers();
     toggleApi = new ToggleApi();
     toggleSyncerApi = new ToggleSyncerApi();
     dragifierApi = new DragifierApi();

     discretizerCore = new DiscretizerCore();
     discretizerDebug = new DiscretizerDebug();

     dragifierCore = new DragifierCore();
     dragifierCells = new DragifierCells();
     dragifier = new Dragifier();

    return gridifier;
}