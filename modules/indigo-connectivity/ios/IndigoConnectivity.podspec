Pod::Spec.new do |s|
  s.name           = 'IndigoConnectivity'
  s.version        = '0.1.0'
  s.summary        = 'Módulo nativo de conectividad de Índigo (NWPathMonitor)'
  s.description    = 'Monitoreo de red en tiempo real vía Network.framework, expuesto a JS como AsyncStream -> eventos, consumido desde core/services/connectivity.service.ts.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  # Solo el nivel superior de ios/: Tests/ NO debe entrar aquí (ver test_spec abajo). Con
  # el glob recursivo "**/*" que traía este archivo hasta la FASE 11, Tests/*.swift se
  # colaba en el target principal del pod -- import XCTest sin XCTest.framework enlazado y
  # @testable import IndigoConnectivity del propio módulo que se está compilando. Nunca se
  # manifestó porque hasta esta fase nada corrió pod install/xcodebuild de verdad.
  s.source_files = "*.{h,m,mm,swift,hpp,cpp}"

  s.test_spec 'Tests' do |test_spec|
    test_spec.source_files = 'Tests/**/*.{h,m,mm,swift}'

    # El target de test no hereda el OTHER_LDFLAGS -lc++ que ExpoModulesCore.podspec deja
    # para las apps que la consumen (user_target_xcconfig) -- el bundle de test enlaza
    # libReactCodegen.a (C++) igual, así que hay que enlazar libc++ a mano. Mismo gotcha
    # documentado en ExpoModulesCore.podspec para su propio test_spec; confirmado real en
    # CI (ios.yml): sin esto, el linker falla con símbolos como "operator new"/
    # "___cxa_throw" indefinidos.
    test_spec.pod_target_xcconfig = {
      'OTHER_LDFLAGS' => '$(inherited) -lc++',
    }
  end
end
