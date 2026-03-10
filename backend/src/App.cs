// Global settings
Globals = Obj(new
{
  debugOn = true,
  detailedAclDebug = false,
  aclOn = true,
  isSpa = true,
  port = args.Length > 0 ? args[0] : "3000",
  serverName = "Minimal API Backend",
  frontendPath = args.Length > 1 ? args[1] : "../dist",
  sessionLifeTimeHours = 2
});

Server.Start();