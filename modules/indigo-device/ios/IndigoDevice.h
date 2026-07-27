#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <IndigoDeviceSpec/IndigoDeviceSpec.h>
#endif

// Función libre con enlace C (no un método privado), igual que en los módulos de las
// FASES 6-8: la única lógica de este módulo testeable con XCTest sin un UIDevice real.
#ifdef __cplusplus
extern "C" {
#endif
BOOL IndigoDeviceIsTabletIdiom(UIUserInterfaceIdiom idiom);
#ifdef __cplusplus
}
#endif

@interface IndigoDevice : NSObject <
#ifdef RCT_NEW_ARCH_ENABLED
                              NativeIndigoDeviceSpec
#else
                              RCTBridgeModule
#endif
                              >

@end
