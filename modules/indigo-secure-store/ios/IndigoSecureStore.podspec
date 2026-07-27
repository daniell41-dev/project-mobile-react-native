Pod::Spec.new do |s|
  s.name           = 'IndigoSecureStore'
  s.version        = '0.1.0'
  s.summary        = 'Módulo nativo de almacenamiento seguro de Índigo (Keychain)'
  s.description    = 'getItem/setItem/removeItem sobre el Keychain de iOS (Security.framework), consumido desde core/services/storage.service.ts.'
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
