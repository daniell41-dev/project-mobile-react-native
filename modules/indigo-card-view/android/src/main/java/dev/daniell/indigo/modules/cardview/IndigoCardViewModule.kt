package dev.daniell.indigo.modules.cardview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class IndigoCardViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IndigoCardView")

    View(IndigoCardView::class) {
      Events("onPress")

      Prop("holderName") { view: IndigoCardView, value: String -> view.setHolderName(value) }
      Prop("last4") { view: IndigoCardView, value: String -> view.setLast4(value) }
      Prop("frozen") { view: IndigoCardView, value: Boolean -> view.setFrozen(value) }
      Prop("accentColor") { view: IndigoCardView, value: String -> view.setAccentColor(value) }
    }
  }
}
