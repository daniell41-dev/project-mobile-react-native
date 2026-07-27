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

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
