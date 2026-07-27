package dev.daniell.indigo.modules.device

import android.content.res.Configuration
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class IndigoDeviceModuleTest {

  @Test
  fun `treats large and xlarge screen layouts as tablets`() {
    assertTrue(isTabletScreenLayout(Configuration.SCREENLAYOUT_SIZE_LARGE))
    assertTrue(isTabletScreenLayout(Configuration.SCREENLAYOUT_SIZE_XLARGE))
  }

  @Test
  fun `treats small and normal screen layouts as phones`() {
    assertFalse(isTabletScreenLayout(Configuration.SCREENLAYOUT_SIZE_SMALL))
    assertFalse(isTabletScreenLayout(Configuration.SCREENLAYOUT_SIZE_NORMAL))
  }

  @Test
  fun `ignores the other screenLayout bits (orientation, RTL) outside the size mask`() {
    val largeWithExtraBits = Configuration.SCREENLAYOUT_SIZE_LARGE or Configuration.SCREENLAYOUT_LAYOUTDIR_RTL
    assertTrue(isTabletScreenLayout(largeWithExtraBits))
  }
}
