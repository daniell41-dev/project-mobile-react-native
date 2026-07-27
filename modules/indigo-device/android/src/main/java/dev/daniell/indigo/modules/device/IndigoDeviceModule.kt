package dev.daniell.indigo.modules.device

import android.content.Context
import android.content.res.Configuration
import android.os.BatteryManager
import android.os.Build
import com.facebook.fbreact.specs.NativeIndigoDeviceSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

// TurboModule "bare": sin Expo Modules API. NativeIndigoDeviceSpec es la clase
// abstracta que genera Codegen a partir de modules/indigo-device/src/NativeIndigoDevice.ts
// (generada en app/build/generated/source/codegen — verificado corriendo
// react-native/scripts/generate-codegen-artifacts.js localmente, sin necesitar Android
// SDK; ver docs/07-capa-nativa-kotlin-swift.md sección 4.4).
// Función de nivel de paquete (no un método privado) a propósito, igual que en los
// módulos de las FASES 6-8: la única lógica de este módulo testeable con JUnit sin un
// Context de Android real.
internal fun isTabletScreenLayout(screenLayout: Int): Boolean {
  val sizeMask = screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK
  return sizeMask >= Configuration.SCREENLAYOUT_SIZE_LARGE
}

@ReactModule(name = NativeIndigoDeviceSpec.NAME)
class IndigoDeviceModule(reactContext: ReactApplicationContext) :
  NativeIndigoDeviceSpec(reactContext) {

  // Síncrono: JSI permite esta llamada directa C++ -> Kotlin sin pasar por el bridge
  // asíncrono legado. @ReactMethod(isBlockingSynchronousMethod = true) en el spec
  // generado es lo que lo habilita — imposible con el bridge JSON pre-New Architecture.
  override fun getDeviceName(): String = "${Build.MANUFACTURER} ${Build.MODEL}"

  override fun isTablet(): Boolean {
    return isTabletScreenLayout(reactApplicationContext.resources.configuration.screenLayout)
  }

  override fun getBatteryLevelAsync(promise: Promise) {
    try {
      // BATTERY_SERVICE es de android.content.Context, no de ReactApplicationContext --
      // aunque ReactApplicationContext hereda de Context, Kotlin no resuelve la
      // constante estática de Java a través del nombre de la subclase. Confirmado real
      // en CI: "Unresolved reference 'BATTERY_SERVICE'".
      val batteryManager =
        reactApplicationContext.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
      val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
      promise.resolve(level.toDouble())
    } catch (e: Exception) {
      promise.reject("ERR_BATTERY_LEVEL", "No se pudo leer el nivel de batería.", e)
    }
  }
}
