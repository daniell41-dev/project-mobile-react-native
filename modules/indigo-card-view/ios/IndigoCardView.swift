import ExpoModulesCore
import SwiftUI
import UIKit

private let defaultAccentColor = Color(red: 0x82.0 / 255, green: 0x0A.0 / 255, blue: 0xD1.0 / 255)

// Función libre (no un método privado), igual que en indigo-biometrics/indigo-secure-store:
// la única lógica de esta vista testeable con XCTest sin un árbol de SwiftUI real.
func parseAccentColor(_ hex: String) -> Color {
  var sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
  if sanitized.hasPrefix("#") {
    sanitized.removeFirst()
  }

  guard sanitized.count == 6, let rgb = UInt64(sanitized, radix: 16) else {
    return defaultAccentColor
  }

  let red = Double((rgb & 0xFF0000) >> 16) / 255
  let green = Double((rgb & 0x00FF00) >> 8) / 255
  let blue = Double(rgb & 0x0000FF) / 255
  return Color(red: red, green: green, blue: blue)
}

private struct CardContent: SwiftUI.View {
  var holderName: String
  var last4: String
  var frozen: Bool
  var accentColor: Color
  var onPress: () -> Void

  var body: some SwiftUI.View {
    ZStack {
      RoundedRectangle(cornerRadius: 20)
        .fill(accentColor)

      VStack(alignment: .leading, spacing: 24) {
        Text("···· ···· ···· \(last4)")
          .foregroundColor(.white)

        HStack(alignment: .bottom) {
          VStack(alignment: .leading, spacing: 2) {
            Text("Titular")
              .foregroundColor(.white.opacity(0.75))
            Text(holderName)
              .foregroundColor(.white)
          }
          Spacer()
          if frozen {
            Text("CONGELADA")
              .foregroundColor(.white)
          }
        }
      }
      .padding(20)
    }
    .contentShape(Rectangle())
    .onTapGesture { onPress() }
  }
}

class IndigoCardView: ExpoView {
  let onPress = EventDispatcher()

  private var holderName: String = "" { didSet { updateContent() } }
  private var last4: String = "" { didSet { updateContent() } }
  private var frozen: Bool = false { didSet { updateContent() } }
  private var accentColor: Color = defaultAccentColor { didSet { updateContent() } }

  private lazy var hostingController: UIHostingController<CardContent> = {
    let controller = UIHostingController(rootView: makeContent())
    controller.view.backgroundColor = .clear
    return controller
  }()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    guard let hostedView = hostingController.view else { return }
    hostedView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(hostedView)
    NSLayoutConstraint.activate([
      hostedView.topAnchor.constraint(equalTo: topAnchor),
      hostedView.bottomAnchor.constraint(equalTo: bottomAnchor),
      hostedView.leadingAnchor.constraint(equalTo: leadingAnchor),
      hostedView.trailingAnchor.constraint(equalTo: trailingAnchor)
    ])
  }

  func setHolderName(_ value: String) {
    holderName = value
  }

  func setLast4(_ value: String) {
    last4 = value
  }

  func setFrozen(_ value: Bool) {
    frozen = value
  }

  func setAccentColor(_ value: String) {
    accentColor = parseAccentColor(value)
  }

  private func makeContent() -> CardContent {
    CardContent(
      holderName: holderName,
      last4: last4,
      frozen: frozen,
      accentColor: accentColor,
      onPress: { [weak self] in self?.onPress() }
    )
  }

  private func updateContent() {
    hostingController.rootView = makeContent()
  }
}
