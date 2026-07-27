package dev.daniell.indigo.modules.device

import com.facebook.fbreact.specs.NativeIndigoDeviceSpec
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

// Sin Expo Modules API no hay autolinking automático: este paquete se registra a mano
// en MainApplication.kt (inyectado por plugins/withIndigoDevice.ts, ver docs/07 4.4) —
// exactamente como se enlazaban los módulos nativos antes de que existiera autolinking.
class IndigoDevicePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == NativeIndigoDeviceSpec.NAME) {
      IndigoDeviceModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      NativeIndigoDeviceSpec.NAME to ReactModuleInfo(
        NativeIndigoDeviceSpec.NAME,
        IndigoDeviceModule::class.java.name,
        false, // canOverrideExistingModule
        false, // needsEagerInit
        false, // isCxxModule
        true, // isTurboModule
      )
    )
  }
}
