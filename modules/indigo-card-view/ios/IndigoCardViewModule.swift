import ExpoModulesCore

public class IndigoCardViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("IndigoCardView")

    View(IndigoCardView.self) {
      Events("onPress")

      Prop("holderName") { (view: IndigoCardView, value: String) in
        view.setHolderName(value)
      }
      Prop("last4") { (view: IndigoCardView, value: String) in
        view.setLast4(value)
      }
      Prop("frozen") { (view: IndigoCardView, value: Bool) in
        view.setFrozen(value)
      }
      Prop("accentColor") { (view: IndigoCardView, value: String) in
        view.setAccentColor(value)
      }
    }
  }
}
