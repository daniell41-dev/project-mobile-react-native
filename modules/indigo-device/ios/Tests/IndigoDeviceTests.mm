#import "IndigoDevice.h"
#import <XCTest/XCTest.h>

// Se compila y corre en CI sobre macos-latest (FASE 11, ios.yml) — no hay Mac local en
// este entorno para ejecutar XCTest. Ver docs/02-guia-deploy-y-ci.md.
@interface IndigoDeviceTests : XCTestCase
@end

@implementation IndigoDeviceTests

- (void)testTreatsPadIdiomAsTablet
{
  XCTAssertTrue(IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiomPad));
}

- (void)testTreatsPhoneAndOtherIdiomsAsNotTablet
{
  XCTAssertFalse(IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiomPhone));
  XCTAssertFalse(IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiomTV));
  XCTAssertFalse(IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiomUnspecified));
}

@end
