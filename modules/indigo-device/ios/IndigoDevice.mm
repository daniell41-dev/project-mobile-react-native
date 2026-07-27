#import "IndigoDevice.h"

// TurboModule "bare": sin Expo Modules API. NativeIndigoDeviceSpec/NativeIndigoDeviceSpecJSI
// son generados por Codegen a partir de modules/indigo-device/src/NativeIndigoDevice.ts
// (verificado corriendo react-native/scripts/generate-codegen-artifacts.js localmente,
// sin necesitar Xcode; ver docs/07-capa-nativa-kotlin-swift.md sección 4.4).

BOOL IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiom idiom) {
  return idiom == UIUserInterfaceIdiomPad;
}

@implementation IndigoDevice
RCT_EXPORT_MODULE(IndigoDevice)

// Síncrono: JSI permite esta llamada directa C++ -> Objective-C sin pasar por el
// bridge asíncrono legado — RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD en vez de
// RCT_EXPORT_METHOD con resolve/reject es lo que lo marca como tal ante Codegen.
RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSString *, getDeviceName)
{
  return [[UIDevice currentDevice] name];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSNumber *, isTablet)
{
  return @(IndigoDeviceIsTabletIdiom([UIDevice currentDevice].userInterfaceIdiom));
}

RCT_EXPORT_METHOD(getBatteryLevelAsync
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject)
{
  UIDevice *device = [UIDevice currentDevice];
  device.batteryMonitoringEnabled = YES;
  float level = device.batteryLevel;

  if (level < 0) {
    reject(@"ERR_BATTERY_LEVEL", @"No se pudo leer el nivel de batería.", nil);
    return;
  }
  resolve(@(level * 100));
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeIndigoDeviceSpecJSI>(params);
}
#endif

@end
