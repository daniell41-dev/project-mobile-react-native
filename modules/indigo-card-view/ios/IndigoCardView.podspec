Pod::Spec.new do |s|
  s.name           = 'IndigoCardView'
  s.version        = '0.1.0'
  s.summary        = 'Vista nativa de la tarjeta de Índigo (SwiftUI bajo Fabric)'
  s.description    = 'ExpoView que embebe un UIHostingController con SwiftUI, consumido desde shared/components/CardVisual.tsx.'
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
