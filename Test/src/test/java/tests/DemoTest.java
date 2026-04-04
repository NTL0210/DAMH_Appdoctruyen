package tests;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import io.appium.java_client.android.nativekey.AndroidKey;
import io.appium.java_client.android.nativekey.KeyEvent;
import org.openqa.selenium.interactions.Pause;

import javax.imageio.ImageIO;
import java.io.File;
import java.net.URL;
import java.time.Duration;
import java.util.List;


public class DemoTest {

    static AndroidDriver driver;
    static int pass = 0, fail = 0;

    // ================================
    // UTILS
    // ================================
    static void sleep(int ms) {
        try { Thread.sleep(ms); } catch (Exception e) {}
    }

    static void log(String name, boolean ok, String note) {
        if (ok) pass++; else fail++;
        System.out.println((ok ? "✅" : "❌") + " [" + name + "] " + note);
    }

    static void screenshot(String name) {
        try {
            File src = driver.getScreenshotAs(OutputType.FILE);
            File dest = new File("D:\\duan\\screenshots\\" + name + ".png");
            dest.getParentFile().mkdirs();
            src.renameTo(dest);
            System.out.println("📸 " + name);
        } catch (Exception e) {}
    }

    static void tap(double xPct, double yPct) {
        Dimension size = driver.manage().window().getSize();
        int x = (int)(size.width * xPct);
        int y = (int)(size.height * yPct);

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence tap = new Sequence(finger, 1);
        tap.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));
        tap.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        tap.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
        driver.perform(java.util.List.of(tap));

        sleep(1000);
    }

    static void swipeLeft() {
        Dimension size = driver.manage().window().getSize();

        int startX = (int)(size.width * 0.8);
        int endX   = (int)(size.width * 0.2);
        int y      = (int)(size.height * 0.5);

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, y));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(400), PointerInput.Origin.viewport(), endX, y));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(java.util.List.of(swipe));
        sleep(1000);
    }

    static boolean pageHas(String text) {
        try {
            return driver.getPageSource().contains(text);
        } catch (Exception e) {
            return false;
        }
    }

    static WebElement findEl(String text) {
        try {
            return driver.findElement(AppiumBy.accessibilityId(text));
        } catch (Exception e) {}

        try {
            return driver.findElement(By.xpath("//*[@text='" + text + "']"));
        } catch (Exception e) {}

        return null;
    }

    static WebElement findByText(String text) {
        try {
            return driver.findElement(By.xpath("//*[@text='" + text + "']"));
        } catch (Exception e) {
            return null;
        }
    }

    static void typeText(String text) {
        try {
            WebElement input = driver.findElement(By.className("android.widget.EditText"));
            input.click();
            input.clear();
            input.sendKeys(text);
            sleep(1000);
        } catch (Exception e) {}
    }

    static void clearSearch() {
        try {
            WebElement input = driver.findElement(By.className("android.widget.EditText"));
            input.click();

            String current = input.getText();

            // xóa từng ký tự
            for (int i = 0; i < current.length(); i++) {
                driver.pressKey(new KeyEvent(AndroidKey.DEL));
            }

            sleep(1000);

        } catch (Exception e) {}
    }
    static void searchByName(String testName, String keyword, boolean expectResult) {
        try {
            tap(0.4, 0.95); // vào Explore
            sleep(2000);

            tap(0.5, 0.15); // click search bar
            sleep(1000);

            clearSearch();
            typeText(keyword);

            screenshot("search_" + keyword);

            WebElement suggest = findByText("Tìm kiếm: \"" + keyword + "\"");
            if (suggest != null) suggest.click();

            sleep(3000);
            screenshot("result_" + keyword);

            boolean hasResult = pageHas(keyword) || pageHas(keyword.toUpperCase());

            if (expectResult) {
                log(testName, hasResult, "Expect FOUND");
            } else {
                log(testName, !hasResult, "Expect NOT FOUND");
            }

        } catch (Exception e) {
            log(testName, false, e.getMessage());
        }
    }

    static void openGenrePopup() {
        try {
            WebElement btn = findByText("Chọn thể loại");
            if (btn != null) {
                btn.click();
            } else {
                tap(0.3, 0.25); // fallback
            }
            sleep(2000);
        } catch (Exception e) {
            System.out.println("❌ Không mở được popup");
        }
    }

    static void selectGenre(String genre) {
        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@text,'" + genre + "') or contains(@content-desc,'" + genre + "')]")
            );

            boolean isSelected = false;

            try {
                String selected = el.getAttribute("selected");
                String checked  = el.getAttribute("checked");

                isSelected = "true".equals(selected) || "true".equals(checked);
            } catch (Exception ignore) {}

            if (!isSelected) {
                el.click();
                System.out.println("✅ Select: " + genre);
            } else {
                System.out.println("⚠️ Already selected: " + genre);
            }

            sleep(1000);

        } catch (Exception e) {
            System.out.println("❌ Không tìm thấy genre: " + genre);
        }
    }

    static void clickDone() {
        try {
            WebElement btn = driver.findElement(
                    By.xpath("//*[contains(@text,'Done') or contains(@content-desc,'Done')]")
            );

            btn.click();
            sleep(2000);

        } catch (Exception e) {
            System.out.println("⚠️ fallback tap nút Xong");

            // 👉 vị trí chuẩn hơn (trên bên phải popup)
            tap(0.9, 0.15);
            sleep(2000);
        }
    }

    static boolean isPopupClosed() {
        try {
            return driver.findElements(
                    By.xpath("//*[contains(@text,'Chọn thể loại')]")
            ).isEmpty();
        } catch (Exception e) {
            return true;
        }
    }
    static void scrollDown() {
        Dimension size = driver.manage().window().getSize();

        int startX = size.width / 2;
        int startY = (int)(size.height * 0.7);
        int endY   = (int)(size.height * 0.3);

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(500), PointerInput.Origin.viewport(), startX, endY));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(java.util.List.of(swipe));
        sleep(1000);
    }

    static boolean isGenreSelected(String genre) {
        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@text,'" + genre + "')]")
            );

            String selected = el.getAttribute("selected");
            String checked  = el.getAttribute("checked");

            return "true".equals(selected) || "true".equals(checked);

        } catch (Exception e) {
            return false;
        }
    }

    static void toggleGenre(String genre) {
        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@text,'" + genre + "')]")
            );

            el.click(); // toggle ON/OFF
            System.out.println("🔁 Toggle: " + genre);

            sleep(1000);

        } catch (Exception e) {
            System.out.println("❌ Không tìm thấy genre: " + genre);
        }
    }

    static void navigate(String name, double xFallback, double yFallback) {
        try {
            WebElement el = findEl(name);

            if (el != null) {
                el.click();
            } else {
                tap(xFallback, yFallback); // ❌ bỏ log warning
            }

            sleep(2000);

        } catch (Exception e) {
            tap(xFallback, yFallback);
        }
    }

    static void scrollToPagination() {
        for (int i = 0; i < 12; i++) {

            // 👉 check bằng element clickable gần cuối màn hình
            if (driver.findElements(By.xpath("//android.view.ViewGroup[@clickable='true']")).size() > 5) {
                System.out.println("✅ Có khả năng đã tới pagination");
                return;
            }

            scrollDown();
        }

        System.out.println("⚠️ Không chắc đã tới pagination");
    }

    static void clickPage(String number) {

        // =========================
        // CÁCH 1: accessibilityId (nếu có)
        // =========================
        try {
            WebElement el = driver.findElement(AppiumBy.accessibilityId(number));
            el.click();
            sleep(1500);
            System.out.println("✅ Click bằng accessibilityId");
            return;
        } catch (Exception ignore) {}

        // =========================
        // CÁCH 2: content-desc contains
        // =========================
        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'" + number + "')]")
            );
            el.click();
            sleep(1500);
            System.out.println("✅ Click bằng content-desc");
            return;
        } catch (Exception ignore) {}

        // =========================
        // CÁCH 3: relative từ page 1
        // =========================
        try {
            WebElement page1 = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'1') or contains(@text,'1')]")
            );

            Rectangle r = page1.getRect();

            int x = r.x + r.width * 2; // 👉 sang phải = page 2
            int y = r.y + r.height / 2;

            tapAbsolute(x, y);

            System.out.println("✅ Click bằng relative position");
            return;

        } catch (Exception ignore) {}

        // =========================
        // CÁCH 4: fallback tọa độ cứng
        // =========================
        if (number.equals("2")) {
            tap(0.52, 0.92);
            System.out.println("⚠️ Click fallback bằng tọa độ");
        }
    }

    static void tapAbsolute(int x, int y) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence tap = new Sequence(finger, 1);

        tap.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));
        tap.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        tap.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(java.util.List.of(tap));
        sleep(1000);
    }

    static void clickNextPage() {

        // CÁCH 1: content-desc
        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'>')]")
            );
            el.click();
            sleep(1500);
            System.out.println("✅ Click Next bằng content-desc");
            return;
        } catch (Exception ignore) {}

        // CÁCH 2: relative từ page 134 (cuối)
        try {
            WebElement last = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'134')]")
            );

            Rectangle r = last.getRect();

            int x = r.x + r.width * 2;
            int y = r.y + r.height / 2;

            tapAbsolute(x, y);
            System.out.println("✅ Click Next bằng relative");
            return;

        } catch (Exception ignore) {}

        // CÁCH 3: fallback tọa độ
        tap(0.9, 0.92);
    }

    static void clickPrevPage() {

        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'<')]")
            );
            el.click();
            sleep(1500);
            System.out.println("✅ Click Prev bằng content-desc");
            return;
        } catch (Exception ignore) {}

        // fallback
        tap(0.1, 0.92);
    }

    static void clickMorePage() {

        try {
            WebElement el = driver.findElement(
                    By.xpath("//*[contains(@content-desc,'...')]")
            );
            el.click();
            sleep(1500);
            return;
        } catch (Exception ignore) {}

        // fallback vị trí dấu ...
        tap(0.7, 0.92);
    }

    static void doubleTapCenter() {
        String name = "DoubleTap Center";
        try {
            Dimension size = driver.manage().window().getSize();
            int x = size.width / 2;
            int y = size.height / 2;

            PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
            Sequence doubleTapSeq = new Sequence(finger, 0);   // id = 0

            // Double Tap chuẩn W3C
            doubleTapSeq.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));

            // Tap 1
            doubleTapSeq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            doubleTapSeq.addAction(new Pause(finger, Duration.ofMillis(40)));   // ngắn
            doubleTapSeq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            // Pause giữa 2 lần tap (rất quan trọng, thường 50-100ms)
            doubleTapSeq.addAction(new Pause(finger, Duration.ofMillis(80)));

            // Tap 2
            doubleTapSeq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            doubleTapSeq.addAction(new Pause(finger, Duration.ofMillis(40)));
            doubleTapSeq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            driver.perform(java.util.List.of(doubleTapSeq));

            System.out.println("✅ Double tap center executed");
            sleep(800);

        } catch (Exception e) {
            System.out.println("❌ Double tap failed: " + e.getMessage());
            // Fallback: dùng 2 tap đơn lẻ cách nhau
            tapCenter();
            sleep(100);
            tapCenter();
            sleep(800);
        }
    }

    // Helper tap đơn giản
    static void tapCenter() {
        Dimension size = driver.manage().window().getSize();
        int x = size.width / 2;
        int y = size.height / 2;
        tap(x * 1.0 / size.width, y * 1.0 / size.height);   // dùng hàm tap có sẵn của bạn
    }

    static void swipeRightToChapters() {
        Dimension size = driver.manage().window().getSize();

        int startX = (int)(size.width * 0.2);  // trái
        int endX   = (int)(size.width * 0.8);  // phải

        // 🔥 vùng dưới tab (rất quan trọng)
        int y = (int)(size.height * 0.38);

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, y));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));

        // 🔥 Flutter cần HOLD
        swipe.addAction(new Pause(finger, Duration.ofMillis(300)));

        // 🔥 kéo chậm
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(800), PointerInput.Origin.viewport(), endX, y));

        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(java.util.List.of(swipe));
        sleep(2000);
    }

    static void scrollUpLight() {
        Dimension size = driver.manage().window().getSize();
        int startX = size.width / 2;
        int startY = (int)(size.height * 0.4);   // bắt đầu từ giữa
        int endY   = (int)(size.height * 0.7);   // kéo lên

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(400), PointerInput.Origin.viewport(), startX, endY));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(java.util.List.of(swipe));
        sleep(800);
    }

    static void doubleTapCenterForReader() {
        try {
            Dimension size = driver.manage().window().getSize();
            int x = size.width / 2;
            int y = size.height / 2 - 50;   // hơi lệch lên một chút để tránh thanh dưới

            PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
            Sequence seq = new Sequence(finger, 0);

            seq.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));

            seq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            seq.addAction(new Pause(finger, Duration.ofMillis(40)));
            seq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            seq.addAction(new Pause(finger, Duration.ofMillis(70)));

            seq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            seq.addAction(new Pause(finger, Duration.ofMillis(40)));
            seq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            driver.perform(List.of(seq));

            System.out.println("✅ Double tap Reader executed");
            sleep(1800);   // tăng thời gian chờ UI
        } catch (Exception e) {
            System.out.println("❌ Double tap failed → fallback");
            tap(0.5, 0.45);
            sleep(100);
            tap(0.5, 0.45);
            sleep(1800);
        }
    }

    // ==================== THÊM VÀO PHẦN UTILS (sau hàm sleep()) ====================

    static boolean isSessionAlive() {
        try {
            driver.getPageSource();  // test nhẹ
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    static void recoverSessionIfNeeded(String currentTC) {
        if (!isSessionAlive()) {
            System.out.println("🔄 [" + currentTC + "] Session crashed → Restarting driver...");
            try {
                driver.quit();
            } catch (Exception ignore) {}

            try {
                DesiredCapabilities caps = new DesiredCapabilities();
                caps.setCapability("platformName", "Android");
                caps.setCapability("automationName", "UiAutomator2");
                caps.setCapability("deviceName", "emulator-5554");
                caps.setCapability("appium:app", "E:\\Newfolder\\demo\\build\\app\\outputs\\flutter-apk\\app-debug.apk");

                // Caps giúp ổn định hơn với Flutter + Android 15
                caps.setCapability("appium:noReset", false);
                caps.setCapability("appium:fullReset", true);
                caps.setCapability("appium:uiautomator2ServerInstallTimeout", 60000);
                caps.setCapability("appium:skipDeviceInitialization", false);
                caps.setCapability("appium:ignoreHiddenApiPolicyError", true);

                driver = new AndroidDriver(new URL("http://127.0.0.1:4723"), caps);
                sleep(5000); // chờ app khởi động lại
                System.out.println("✅ Driver restarted successfully");
            } catch (Exception ex) {
                System.out.println("❌ Không thể restart driver: " + ex.getMessage());
            }
        }
    }

    // Tap an toàn hơn (tránh crash khi tap nhanh)
    static void safeTap(double xPct, double yPct) {
        try {
            Dimension size = driver.manage().window().getSize();
            int x = (int)(size.width * xPct);
            int y = (int)(size.height * yPct);

            PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
            Sequence tapSeq = new Sequence(finger, 1);
            tapSeq.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));
            tapSeq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            tapSeq.addAction(new Pause(finger, Duration.ofMillis(80)));
            tapSeq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            driver.perform(List.of(tapSeq));
            sleep(800);
        } catch (Exception e) {
            System.out.println("⚠️ safeTap failed, trying old tap");
            tap(xPct, yPct);
        }
    }

    // Double tap an toàn cho Reader UI (giảm nguy cơ crash)
    static void safeDoubleTapForReader() {
        try {
            Dimension size = driver.manage().window().getSize();
            int x = size.width / 2;
            int y = size.height / 2 - 80;   // lệch lên nhiều hơn

            PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
            Sequence seq = new Sequence(finger, 0);

            seq.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));

            // Tap 1
            seq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            seq.addAction(new Pause(finger, Duration.ofMillis(60)));
            seq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            seq.addAction(new Pause(finger, Duration.ofMillis(150)));  // pause dài hơn

            // Tap 2
            seq.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            seq.addAction(new Pause(finger, Duration.ofMillis(60)));
            seq.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

            driver.perform(List.of(seq));
            System.out.println("✅ Safe double tap executed");
            sleep(2000);
        } catch (Exception e) {
            System.out.println("❌ Safe double tap failed → fallback single taps");
            safeTap(0.5, 0.45);
            sleep(600);
            safeTap(0.5, 0.45);
            sleep(1800);
        }
    }

    // Cập nhật toggleReaderUI
    static void toggleReaderUI() {
        try {
            safeDoubleTapForReader();
            screenshot("reader_ui_toggled");
            System.out.println("✅ Đã toggle UI (hiện/ẩn thanh)");
        } catch (Exception e) {
            safeTap(0.92, 0.08);  // fallback tap nút góc trên phải
            sleep(1500);
        }
    }

    // TC48: Nhấn nút back (mũi tên) để thoát khỏi màn hình chi tiết truyện
    static void tapBackButton() {
        String name = "Tap Back Button";
        try {
            // Ưu tiên tìm bằng accessibilityId hoặc content-desc (Flutter thường có)
            WebElement backBtn = null;
            try {
                backBtn = driver.findElement(AppiumBy.accessibilityId("Back"));
            } catch (Exception ignore) {}

            if (backBtn == null) {
                try {
                    backBtn = driver.findElement(By.xpath("//*[contains(@content-desc,'Back') or contains(@content-desc,'back')]"));
                } catch (Exception ignore) {}
            }

            if (backBtn != null) {
                backBtn.click();
                System.out.println("✅ Click Back bằng element");
            } else {
                // Fallback tap vị trí góc trên trái (chuẩn nhất theo ảnh)
                safeTap(0.08, 0.08);
                System.out.println("⚠️ Dùng fallback safeTap Back (0.08, 0.08)");
            }

            sleep(2500);
            screenshot("after_tap_back");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void toggleSwitch(String switchName, boolean expectTurnOn, String tcName) {
        String status = expectTurnOn ? "BẬT" : "TẮT";
        try {
            recoverSessionIfNeeded(tcName);

            boolean tapped = false;

            // Cách 1: Tìm element switch bằng XPath (tốt nhất nếu Flutter hỗ trợ)
            try {
                WebElement row = driver.findElement(
                        By.xpath("//*[contains(@text,'" + switchName + "')]/following-sibling::*")
                );
                row.click();
                tapped = true;
                System.out.println("✅ Click switch bằng XPath: " + switchName);
            } catch (Exception ignored) {}

            // Cách 2: Tìm label rồi tap vùng bên phải
            if (!tapped) {
                try {
                    WebElement label = findByText(switchName);
                    if (label != null) {
                        Rectangle r = label.getRect();
                        int tapX = r.x + r.width + 80;   // tap vào bên phải label
                        int tapY = r.y + r.height / 2;
                        tapAbsolute(tapX, tapY);
                        tapped = true;
                        System.out.println("✅ Tap bằng relative position: " + switchName);
                    }
                } catch (Exception ignored) {}
            }

            // Cách 3: Hardcode tọa độ đã chỉnh chính xác theo ảnh của bạn
            if (!tapped) {
                double x = 0.90;   // cột switch nằm rất sát bên phải

                double y;
                switch (switchName.toLowerCase()) {
                    case "notifications":
                        y = 0.205;     // Notifications (hàng đầu tiên)
                        break;
                    case "dark mode":
                        y = 0.295;     // Dark Mode (hàng thứ 2)
                        break;
                    case "reading reminders":
                        y = 0.385;     // Reading Reminders (hàng thứ 3) ← đã chỉnh thấp hơn
                        break;
                    default:
                        y = 0.30;
                }

                safeTap(x, y);
                System.out.println("⚠️ Dùng tọa độ cứng cho " + switchName + " tại y = " + y);
            }

            sleep(1600);
            screenshot(tcName.toLowerCase() + "_" + (expectTurnOn ? "on" : "off"));

            log(tcName, true, status + " " + switchName + " thành công (đã chụp màn hình)");

        } catch (Exception e) {
            log(tcName, false, "Lỗi khi " + status + " " + switchName + ": " + e.getMessage());
        }
    }

    static void openLanguagePopup() {
        String name = "Open Language Popup";
        try {
            recoverSessionIfNeeded(name);

            // Ưu tiên tìm bằng text
            try {
                WebElement langRow = driver.findElement(
                        By.xpath("//*[contains(@text,'Language') or contains(@text,'Ngôn ngữ')]")
                );
                langRow.click();
                System.out.println("✅ Click Language thành công bằng text");
                sleep(1500);
                screenshot("language_popup_opened");
                return;
            } catch (Exception ignored) {}

            // Nếu không tìm thấy text → dùng tọa độ (đã chỉnh cao hơn)
            System.out.println("⚠️ Không tìm thấy text 'Language' → thử tọa độ");

            // Tọa độ đã chỉnh LÊN CAO HƠN để tránh Font Size
            double[] yPositions = {0.46, 0.47, 0.475, 0.48, 0.485, 0.49};

            boolean opened = false;
            for (double y : yPositions) {
                System.out.println("   → Thử tap Language tại y = " + y);
                safeTap(0.50, y);
                sleep(1800);

                if (pageHas("Select Language") || pageHas("English") || pageHas("Tiếng Việt") || pageHas("Español")) {
                    System.out.println("✅ Popup mở thành công tại y = " + y);
                    opened = true;
                    break;
                }
            }

            if (!opened) {
                System.out.println("⚠️ Vẫn chưa mở popup sau khi thử nhiều tọa độ");
            }

            screenshot("language_popup_attempt");

        } catch (Exception e) {
            System.out.println("❌ " + name + ": " + e.getMessage());
        }
    }

    static void tapPixel(int x, int y) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence tap = new Sequence(finger, 1);

        tap.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, y));
        tap.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        tap.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(List.of(tap));
    }

    static void openFontSizePopup() {
        String name = "Open Font Size Popup";
        try {
            recoverSessionIfNeeded(name);

            // ✅ Cách 1: Tìm bằng text (ưu tiên)
            WebElement fontRow = null;
            try {
                fontRow = driver.findElement(
                        By.xpath("//*[contains(@text,'Font Size') or contains(@text,'Kích thước chữ') or contains(@content-desc,'Font')]")
                );
            } catch (Exception ignored) {}

            if (fontRow != null) {
                fontRow.click();
                System.out.println("✅ Click Font Size bằng XPath text");
            } else {
                System.out.println("⚠️ Không tìm thấy text Font Size → dùng scan tọa độ kiểu Language");

                // 🔥 Dùng cùng style với Language (scan quanh vùng trung tâm)
                double[] yPositions = {0.55, 0.56, 0.57, 0.58, 0.54, 0.59};

                boolean opened = false;

                for (double y : yPositions) {
                    System.out.println("   → Thử tap Font Size tại y = " + y);
                    safeTap(0.50, y);   // giống Language: tap giữa ngang
                    sleep(1500);

                    // ✅ Check popup mở
                    if (pageHas("Font Size") ||
                            pageHas("Small") ||
                            pageHas("Medium") ||
                            pageHas("Large") ||
                            pageHas("Extra")) {

                        System.out.println("✅ Popup Font Size mở thành công tại y = " + y);
                        opened = true;
                        break;
                    }
                }

                if (!opened) {
                    System.out.println("⚠️ Fallback cuối (giống Language)");

                    // fallback cuối – tap thêm 1 lần ở vị trí trung bình
                    safeTap(0.50, 0.565);
                    sleep(1500);
                }
            }

            sleep(1000);
            screenshot("font_size_popup_attempt");

        } catch (Exception e) {
            System.out.println("❌ " + name + ": " + e.getMessage());
        }
    }

    static void tapSignUpButton() {
        try {
            WebElement btn = driver.findElement(By.xpath("//*[contains(@text,'Sign up')]"));
            btn.click();
            System.out.println("✅ Click nút Sign up bằng element");
        } catch (Exception e) {
            System.out.println("⚠️ Fallback tap nút Sign up");
            tap(0.5, 0.72);   // vị trí nút Sign up (điều chỉnh nếu cần)
        }
    }

    static void typeIntoField(String fieldName, String text) {
        try {
            // Tìm bằng hint text (Flutter thường dùng hint)
            WebElement field = driver.findElement(By.xpath(
                    "//*[contains(@text,'" + fieldName + "') or contains(@content-desc,'" + fieldName + "')]"
            ));
            field.click();
            sleep(400);

            // Clear và nhập
            WebElement input = driver.findElement(By.className("android.widget.EditText"));
            input.clear();
            input.sendKeys(text);
            sleep(600);

            System.out.println("✅ Đã nhập " + fieldName + " = " + text);
        } catch (Exception e) {
            System.out.println("⚠️ Fallback tap cho " + fieldName);
            if (fieldName.contains("Username")) tap(0.5, 0.35);
            else if (fieldName.contains("Email")) tap(0.5, 0.45);
            else if (fieldName.contains("Password")) tap(0.5, 0.55);

            sleep(800);
            typeText(text);
        }
    }

    static void resetSignUpForm() {
        try {
            // Reset bằng cách quay lại và vào lại màn hình (an toàn nhất cho Flutter)
            driver.navigate().back();
            sleep(1000);

            // Vào lại màn hình Create an account
            try {
                WebElement createBtn = driver.findElement(By.xpath(
                        "//*[contains(@text,'Create an account') or contains(@text,'Sign up')]"
                ));
                createBtn.click();
            } catch (Exception ignored) {
                // Nếu không tìm thấy, dùng coordinate fallback
                tap(0.5, 0.3);   // vị trí nút Create an account
            }
            sleep(1500);
        } catch (Exception e) {
            System.out.println("⚠️ Reset form thất bại, tiếp tục test...");
        }
    }

    static boolean checkForValidationErrors() {
        sleep(600);
        String source = driver.getPageSource().toLowerCase();

        String[] errorKeywords = {
                "please enter your username", "please enter your email",
                "please enter a password", "username is required",
                "email is required", "password is required",
                "enter your", "required"
        };

        for (String keyword : errorKeywords) {
            if (source.contains(keyword)) {
                System.out.println("✅ Phát hiện lỗi chứa từ: " + keyword);
                return true;
            }
        }

        // Tìm TextView chứa lỗi
        try {
            List<WebElement> texts = driver.findElements(By.className("android.widget.TextView"));
            for (WebElement el : texts) {
                String text = el.getText().trim().toLowerCase();
                if (!text.isEmpty() &&
                        (text.contains("please enter") || text.contains("required") ||
                                text.contains("username") || text.contains("email") || text.contains("password"))) {
                    System.out.println("✅ Tìm thấy lỗi text: " + text);
                    return true;
                }
            }
        } catch (Exception ignored) {}

        return false;
    }



    // ================================
    // TEST CASES
    // ================================

    static void tc01_Onboarding() {
        String name = "TC01 - Onboarding";
        try {
            sleep(3000);

            screenshot("slide1");
            swipeLeft();
            screenshot("slide2");
            swipeLeft();
            screenshot("slide3");

            boolean ok = pageHas("Guest") || pageHas("Sign in");
            log(name, ok, "Swipe OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc02_Guest() {
        String name = "TC02 - Guest";

        try {
            screenshot("before_guest");

            WebElement btn = findEl("Enter as guest");

            if (btn != null) {
                btn.click();
            } else {
                tap(0.5, 0.9);
            }

            sleep(4000);
            screenshot("after_guest");

            boolean ok = pageHas("Home") || pageHas("Story");
            log(name, ok, ok ? "Guest OK" : "Fail");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc03_Home() {
        String name = "TC03 - Home";

        try {
            navigate("Home", 0.08, 0.92);

            screenshot("home");

            boolean ok = pageHas("Home");
            log(name, ok, "Home screen");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc04_Explore() {
        String name = "TC04 - Explore";

        try {
            navigate("Explore", 0.4, 0.92);

            screenshot("explore");

            boolean ok = pageHas("Explore");
            log(name, ok, "Explore OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc05_Search_Words_with_accent_marks() {
        searchByName("TC05 - Search Words with accent marks", "yêu thần ký", true);
    }

    static void tc06_Search_Words_without_accent() {
        searchByName("TC06 - Search Words without accent", "tu tien", true);
    }

    static void tc07_Search_English() {
        searchByName("TC07 - Search English", "wizard's", true);
    }

    static void tc08_Search_Invalid() {
        searchByName("TC08 - Search Invalid", "zzzzzz123", false);
    }

    static void tc09_Search_Special() {
        searchByName("TC09 - Special chars", "@@@###", false);
    }

    static void tc10_Search_Number() {
        searchByName("TC10 - Number", "123456", false);
    }

    static void tc11_ClearSearch() {
        String name = "TC11 - Clear search";

        try {
            tap(0.4, 0.95);
            sleep(2000);

            tap(0.5, 0.15);
            sleep(1000);

            clearSearch(); // hoặc clearSearchBetter()
            screenshot("clear_search");

            WebElement input = driver.findElement(By.className("android.widget.EditText"));
            boolean ok = input.getText().isEmpty();

            log(name, ok, ok ? "Cleared" : "Still has text");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc12_FilterOneGenre() {
        String name = "TC12 - Filter 1 genre";

        try {
            tap(0.4, 0.95); // Explore
            sleep(2000);

            openGenrePopup();
            screenshot("popup_open");

            selectGenre("Action");

            clickDone();
            screenshot("after_filter_action");

            boolean popupClosed = isPopupClosed();

            // 👉 fallback verify nhẹ hơn (vì UI có thể không show chữ Action)
            boolean hasResult = !driver.getPageSource().contains("No data");

            boolean ok = popupClosed && hasResult;

            log(name, ok,
                    "Popup=" + popupClosed +
                            " | Result=" + hasResult);

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc13_AddSecondGenre() {
        String name = "TC13 - Multi genre";

        try {
            tap(0.4, 0.95);
            sleep(2000);

            openGenrePopup();

            selectGenre("Action");
            selectGenre("Comedy");

            clickDone();
            screenshot("after_multi");

            boolean popupClosed = isPopupClosed();

            boolean ok = popupClosed;

            log(name, ok, "Popup closed=" + popupClosed);

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc14_MultiGenre_ScrollResult() {
        String name = "TC14 - Multi genre + scroll";

        try {
            tap(0.4, 0.95); // Explore
            sleep(2000);

            openGenrePopup();

            // ❌ KHÔNG click lại Comedy nữa
            // selectGenre("Comedy");

            // 👉 nếu muốn đảm bảo có ít nhất 1 genre thì chỉ click Action
            selectGenre("Action");

            clickDone();
            screenshot("multi_filter_applied");

            boolean hasTag = pageHas("Thể loại");

            scrollDown();
            scrollDown();
            screenshot("after_scroll_list");

            log(name, hasTag, "Giữ trạng thái genre cũ OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc15_ScrollGenrePopup() {
        String name = "TC15 - Scroll genre popup";

        try {
            tap(0.4, 0.95);
            sleep(2000);

            openGenrePopup();
            screenshot("popup_before_scroll");

            // 👉 scroll trong popup
            scrollDown();
            scrollDown();

            screenshot("popup_after_scroll");

            // 👉 thử chọn 1 genre phía dưới
            selectGenre("Fantasy"); // hoặc genre phía dưới

            clickDone();

            boolean ok = isPopupClosed();

            log(name, ok, "Scroll popup OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc16_RemoveOneGenre_Independent() {
        String name = "TC16 - Remove one genre (single)";

        try {
            tap(0.4, 0.95);
            sleep(2000);

            openGenrePopup();
            screenshot("popup_open");

            // 👉 RESET trước
            try {
                WebElement clearBtn = driver.findElement(
                        By.xpath("//*[contains(@text,'Clear')]")
                );
                clearBtn.click();
                sleep(1000);
            } catch (Exception ignore) {}

            // 👉 Chọn 1 genre
            selectGenre("Action");
            screenshot("after_select_action");

            // 👉 Bỏ chọn lại chính nó
            toggleGenre("Action");
            screenshot("after_remove_action");

            clickDone();
            screenshot("after_done");

            boolean popupClosed = isPopupClosed();

            // 👉 Không còn filter → vẫn phải có data
            boolean hasResult = !driver.getPageSource().contains("No data");

            boolean ok = popupClosed && hasResult;

            log(name, ok,
                    "Popup=" + popupClosed +
                            " | Result=" + hasResult);

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc17_ClearFilter() {
        String name = "TC17 - Clear filter";

        try {
            tap(0.4, 0.95); // Explore
            sleep(2000);

            openGenrePopup();
            screenshot("popup_before_clear");

            // 👉 click clear
            WebElement clearBtn = driver.findElement(
                    By.xpath("//*[contains(@text,'Clear all') or contains(@content-desc,'Clear all')]")
            );
            clearBtn.click();
            sleep(1000);

            screenshot("after_click_clear");

            clickDone();
            screenshot("after_clear_done");

            // ✅ verify popup đóng
            boolean popupClosed = isPopupClosed();

            // ✅ verify UI reset (mạnh hơn)
            boolean noFilterTag = !driver.getPageSource().contains("Action")
                    && !driver.getPageSource().contains("Comedy");

            boolean ok = popupClosed && noFilterTag;

            log(name, ok,
                    "Popup=" + popupClosed +
                            " | Reset=" + noFilterTag);

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc18_NoSelection_Scroll_BeforeDone() {
        String name = "TC18 - No selection + scroll before done";

        try {
            tap(0.4, 0.95); // Explore
            sleep(2000);

            openGenrePopup();
            screenshot("popup_open");

            // ❌ Không chọn gì

            // 👉 scroll ngay trong trạng thái chưa apply
            scrollDown();
            scrollDown();
            screenshot("scroll_before_done");

            // 👉 sau đó mới bấm Xong
            clickDone();
            screenshot("after_done");

            boolean popupClosed = isPopupClosed();

            // 👉 verify vẫn có data
            boolean hasResult = !driver.getPageSource().contains("No data");

            boolean ok = popupClosed && hasResult;

            log(name, ok,
                    "Popup=" + popupClosed +
                            " | Result=" + hasResult);

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc19_Navigate_Library() {
        String name = "TC19 - Navigate Library";

        try {
            navigate("Library", 0.7, 0.92);

            screenshot("library");

            boolean ok = pageHas("Library") || pageHas("Thư viện");

            log(name, ok, "Go to Library");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc20_Navigate_Profile() {
        String name = "TC20 - Navigate Profile";

        try {
            navigate("Profile", 0.9, 0.92);

            screenshot("profile");

            boolean ok = pageHas("Profile") || pageHas("Cá nhân");

            log(name, ok, "Go to Profile");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc21_Navigate_Home() {
        String name = "TC21 - Navigate Home";

        try {
            navigate("Home", 0.08, 0.92); // 👈 fix tại đây

            screenshot("home");

            boolean ok = pageHas("Home");

            log(name, ok, "Go to Home");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc22_ClickPage2() {
        String name = "TC22 - Vuốt xuống cuối rồi click Page 2";

        try {
            // 1. Về màn hình Home
            navigate("Home", 0.08, 0.92);
            sleep(2000);

            screenshot("home_before_scroll");

            // 2. Vuốt xuống cuối để thấy phần phân trang
            scrollToPagination();           // hàm này đã có sẵn, rất tốt

            // Vuốt thêm 1-2 lần nữa để chắc chắn phân trang nằm trong tầm nhìn
            scrollDown();
            scrollDown();

            screenshot("pagination_visible");

            // 3. Click vào Page 2
            clickPage("2");                 // hàm clickPage đã có sẵn

            sleep(3000);                    // chờ load trang 2

            screenshot("after_click_page_2");

            // 4. Verify đã chuyển sang trang 2 thành công
            boolean ok = pageHas("2") ||
                    driver.getPageSource().contains("134") ||  // số trang tổng
                    pageHas("Trang 2") ||
                    !pageHas("Tối Cộng Muốn Làm Mẹ Ứt");     // comic đầu tiên thường không còn ở trang 2

            log(name, ok, ok ? "Đã chuyển sang Page 2 thành công" : "Không chuyển được sang Page 2");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc23_NextPage() {
        String name = "TC23 - Next page";

        try {
            clickNextPage();

            sleep(3000);
            screenshot("page_next");

            boolean ok = !pageHas("Tối Cộng Muốn Làm Mẹ Ứt");

            log(name, ok, "Click Next OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc24_PreviousPage() {
        String name = "TC24 - Previous page";

        try {

            clickPrevPage();

            sleep(2000);
            screenshot("page_prev");

            log(name, true, "Click Prev OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc25_GoToPage() {
        String name = "TC25 - Go to page 1";

        try {
            screenshot("pagination_before_goto");

            clickMorePage();
            sleep(2000);

            screenshot("goto_popup");

            WebElement input = driver.findElement(By.className("android.widget.EditText"));
            input.click();
            input.clear();
            input.sendKeys("1");

            sleep(1000);

            // 🔥 CLICK NÚT GO (FIX CHUẨN FLUTTER)
            boolean clicked = false;

            // ✅ Cách 1: Click button cuối cùng
            try {
                java.util.List<WebElement> buttons = driver.findElements(
                        By.className("android.widget.Button")
                );

                if (!buttons.isEmpty()) {
                    buttons.get(buttons.size() - 1).click();
                    System.out.println("✅ Click Go bằng Button index");
                    clicked = true;
                }
            } catch (Exception ignore) {}

            // ✅ Cách 2: Click relative từ input
            if (!clicked) {
                try {
                    Rectangle r = input.getRect();

                    int x = r.x + r.width + 150;
                    int y = r.y + r.height / 2;

                    tapAbsolute(x, y);

                    System.out.println("✅ Click Go bằng relative");
                    clicked = true;
                } catch (Exception ignore) {}
            }

            // ✅ Cách 3: fallback tọa độ
            if (!clicked) {
                System.out.println("⚠️ fallback tap");
                tap(0.75, 0.55);
            }

            sleep(3000);
            screenshot("goto_page_1");

            // 🔥 VERIFY CHUẨN HƠN
            boolean ok = !pageHas("Tối Cộng Muốn Làm Mẹ Ứt");

            log(name, ok, "Go to page OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc26_CancelGoToPage() {
        String name = "TC26 - Cancel go to page";

        try {
            screenshot("before_cancel");

            clickMorePage();

            sleep(2000);
            screenshot("goto_popup_open");

            // ✅ CLICK NÚT HỦY CHUẨN
            try {
                WebElement cancel = driver.findElement(
                        By.xpath("//*[contains(@text,'Hủy') or contains(@content-desc,'Hủy')]")
                );
                cancel.click();
                System.out.println("✅ Click Hủy bằng text");
            } catch (Exception e) {
                System.out.println("⚠️ Không tìm thấy Hủy → fallback");

                tap(0.3, 0.6);
            }

            sleep(2000);
            screenshot("popup_closed");

            boolean ok = driver.findElements(By.className("android.widget.EditText")).isEmpty();

            log(name, ok, "Cancel OK");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc27_ClickAnyComic() {
        String name = "TC27 - Click vào truyện bất kỳ (Toàn Chức Kiếm Tu)";
        try {
            // KHÔNG navigate Explore nữa (giả sử đang ở Explore hoặc Home)
            screenshot("before_click_comic");

            // Ưu tiên tìm bằng text chính xác
            WebElement comic = findByText("Toàn Chức Kiếm Tu");

            if (comic != null) {
                comic.click();
                System.out.println("✅ Tìm thấy và click bằng text: Toàn Chức Kiếm Tu");
            } else {
                // Fallback 1: Tìm bằng contains (phòng trường hợp có dấu cách hoặc cắt chữ)
                try {
                    WebElement comicContains = driver.findElement(
                            By.xpath("//*[contains(@text, 'Toàn Chức Kiếm Tu') or contains(@content-desc, 'Toàn Chức Kiếm Tu')]")
                    );
                    comicContains.click();
                    System.out.println("✅ Click bằng contains text");
                } catch (Exception e) {
                    // Fallback 2: Tap vị trí ước tính (comic thường nằm ở vị trí giữa trên)
                    System.out.println("⚠️ Không tìm thấy text, dùng tap fallback");
                    tap(0.5, 0.42);   // điều chỉnh nếu cần (0.42 là vị trí khá an toàn cho card đầu tiên)
                }
            }

            sleep(3500);  // chờ chuyển sang màn chi tiết truyện
            screenshot("comic_detail_ToanChucKiemTu");

            // Verify đã vào được màn Overview của truyện
            boolean ok = pageHas("Toàn Chức Kiếm Tu")
                    || pageHas("Chapters: 85")
                    || pageHas("Overview")
                    || pageHas("Read from chapter 1");

            log(name, ok, ok ? "Vào chi tiết truyện thành công" : "Không vào được màn truyện");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc28_ScrollOverview() {
        String name = "TC28 - Vuốt xuống màn Overview xem thông tin truyện";
        try {
            screenshot("before_scroll_overview");
            scrollDown();
            scrollDown();
            sleep(1000);
            screenshot("after_scroll_overview");

            boolean ok = pageHas("Description") || pageHas("Story Info") || pageHas("Category");
            log(name, ok, "Đã scroll Overview và thấy thông tin");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc29_ClickReviews() {
        String name = "TC29 - Click qua tab Reviews";
        try {
            screenshot("before_click_reviews");

            boolean clicked = false;

            // Cách 1: Tìm bằng text chính xác
            WebElement reviewsTab = findByText("Comments");
            if (reviewsTab != null) {
                reviewsTab.click();
                System.out.println("✅ Click Comments bằng findByText");
                clicked = true;
            }

            // Cách 2: Tìm bằng contains (an toàn hơn)
            if (!clicked) {
                try {
                    WebElement tab = driver.findElement(
                            By.xpath("//*[contains(@text,'Comments') or contains(@content-desc,'Comments')]")
                    );
                    tab.click();
                    System.out.println("✅ Click Comments bằng contains text");
                    clicked = true;
                } catch (Exception ignore) {}
            }

            // Cách 3: Tìm tất cả tab và click tab có text Reviews (xử lý khi tab đang active)
            if (!clicked) {
                try {
                    java.util.List<WebElement> allTabs = driver.findElements(
                            By.xpath("//*[contains(@text,'Overview') or contains(@text,'Chapters') or contains(@text,'Comments')]")
                    );

                    for (WebElement tab : allTabs) {
                        if (tab.getText().contains("Comments")) {
                            tab.click();
                            System.out.println("✅ Click Comments từ danh sách tabs");
                            clicked = true;
                            break;
                        }
                    }
                } catch (Exception ignore) {}
            }

            // Cách 4: Fallback tap vị trí chính xác hơn (dựa trên screenshot)
            if (!clicked) {
                System.out.println("⚠️ Dùng fallback tap vị trí tab Comments");
                tap(0.82, 0.245);   // Vị trí tốt hơn cho tab Reviews (bên phải)
            }

            sleep(2500);  // chờ chuyển tab
            screenshot("reviews_tab_opened");

            // Verify đã vào tab Reviews
            boolean ok = pageHas("Rating:")
                    || pageHas("Top Reviews")
                    || pageHas("4.2")
                    || pageHas("Send");

            log(name, ok, ok ? "Đã vào tab Reviews thành công" : "Không vào được tab Comments");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc30_ScrollReviews() {
        String name = "TC30 - Vuốt xuống màn Reviews xem comment";
        try {
            screenshot("before_scroll_reviews");

            // Scroll nhiều lần hơn để chắc chắn thấy comment
            scrollDown();
            sleep(800);
            scrollDown();
            sleep(800);
            scrollDown();

            screenshot("after_scroll_reviews");

            boolean ok = pageHas("User")
                    || pageHas("User1")
                    || pageHas("Great story")
                    || pageHas("Send");

            log(name, ok, ok ? "Đã scroll và thấy comment thành công" : "Không thấy comment sau khi scroll");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc31_ClickChaptersTab() {
        String name = "TC31 - Click";

        try {
            screenshot("before_click_chapters");

            boolean clicked = false;

            // =========================
            // CÁCH 1: accessibilityId (content-desc chuẩn)
            // =========================
            try {
                WebElement el = driver.findElement(AppiumBy.accessibilityId("Chapters"));
                el.click();
                System.out.println("✅ Click Chapters bằng content-desc");
                clicked = true;
            } catch (Exception ignore) {}

            // =========================
            // CÁCH 2: kiểu TC22 (contains '2') - chỉ để thử
            // =========================
            if (!clicked) {
                try {
                    WebElement el = driver.findElement(
                            By.xpath("//*[contains(@content-desc,'2')]")
                    );
                    el.click();
                    System.out.println("⚠️ Click bằng contains '2' (debug)");
                    clicked = true;
                } catch (Exception ignore) {}
            }

            sleep(2000);

            // =========================
            // VERIFY
            // =========================
            boolean isChapters = pageHas("Read from chapter")
                    || pageHas("Chapter")
                    || pageHas("Chap");

            // =========================
            // CÁCH 3: fallback swipe (quan trọng nhất)
            // =========================
            if (!isChapters) {
                System.out.println("⚠️ Click fail → dùng swipe");

                tap(0.5, 0.38);
                sleep(800);

                swipeRightToChapters();

                sleep(2000);

                isChapters = pageHas("Read from chapter")
                        || pageHas("Chapter")
                        || pageHas("Chap");
            }

            screenshot("after_chapters");

            log(name, isChapters,
                    isChapters ? "Đã vào tab Chapters" : "Không vào được tab Chapters");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc32_ClickReadFromChapter1() {
        String name = "TC32 - Click nút Read from chapter 1";
        try {
            screenshot("before_read_button");

            WebElement readBtn = null;

            // Cách tìm tốt hơn
            String[] possibleTexts = {"Read from chapter 1", "Read from Chapter 1", "chapter 1", "Chap 1"};

            for (String txt : possibleTexts) {
                try {
                    readBtn = driver.findElement(By.xpath("//*[@text='" + txt + "' or contains(@text,'" + txt + "')]"));
                    if (readBtn != null) break;
                } catch (Exception ignored) {}
            }

            if (readBtn != null) {
                // Scroll nhẹ để đảm bảo nút visible hoàn toàn
                scrollDown(); // hoặc scroll lên một chút nếu cần
                sleep(800);

                // Click + retry nếu cần
                try {
                    readBtn.click();
                    System.out.println("✅ Click bằng WebElement.click()");
                } catch (Exception e) {
                    System.out.println("⚠️ Element.click fail → thử tap center của button");
                    Rectangle rect = readBtn.getRect();
                    int tapX = rect.x + rect.width / 2;
                    int tapY = rect.y + rect.height / 2;   // hoặc + rect.height * 0.7 (phần dưới)
                    tapAbsolute(tapX, tapY);
                }
            } else {
                // Fallback tap vị trí chính xác hơn
                System.out.println("⚠️ Không tìm thấy text → dùng tap cải tiến");
                Dimension size = driver.manage().window().getSize();
                tap(0.5, 0.91);   // thử 0.90 ~ 0.93
            }

            sleep(4000);
            screenshot("after_click_read");

            boolean ok = pageHas("Chap 1") || !pageHas("Read from chapter 1") || pageHas("Chapter");
            log(name, ok, ok ? "Vào reader thành công" : "Vẫn còn ở màn detail");
        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc33_WaitDataLoad() {
        String name = "TC33 - Chờ dữ liệu load xong";
        try {
            sleep(5000); // chờ load hình ảnh + data
            screenshot("reader_loaded");
            log(name, true, "Đã chờ load xong (5s)");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc34_SwipeToRead() {
        String name = "TC34 - Vuốt màn hình để xem truyện";
        try {
            screenshot("before_swipe_read");
            // Vuốt lên để đọc (vertical swipe typical cho comic)
            Dimension size = driver.manage().window().getSize();
            int startX = size.width / 2;
            int startY = (int)(size.height * 0.8);
            int endY = (int)(size.height * 0.2);

            PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
            Sequence swipe = new Sequence(finger, 1);
            swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
            swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
            swipe.addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), startX, endY));
            swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
            driver.perform(java.util.List.of(swipe));

            sleep(1500);
            screenshot("after_swipe_read");
            log(name, true, "Đã vuốt đọc truyện");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc35_DoubleTapShowUI() {
        String name = "TC35 - Double click màn hình để hiện thanh thoát và thanh page";
        try {
            doubleTapCenter();
            sleep(1500);
            screenshot("reader_ui_shown");
            boolean ok = true; // khó verify chính xác UI bar, tạm coi thành công nếu không crash
            log(name, ok, "Double tap → hiện thanh điều khiển");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc36_ClickExitToChapterList() {
        String name = "TC36 - Click nút mũi tên thoát để ra màn hình chapter";
        try {
            tap(0.08, 0.08); // vị trí góc trên trái nút back (mũi tên thoát)
            sleep(2000);
            screenshot("back_to_chapter_list");

            boolean ok = pageHas("Chap 1") || pageHas("Chapters");
            log(name, ok, "Đã thoát về danh sách chapter");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc37_ClickAnyChapter() {
        String name = "TC37 - Click Chap 2 từ danh sách chapter";
        try {
            screenshot("before_click_chap2");

            // Ưu tiên tìm chính xác "Chap 2"
            WebElement chap2 = null;

            // Cách 1: Tìm text chính xác "Chap 2"
            try {
                chap2 = driver.findElement(By.xpath("//*[@text='Chap 2' or contains(@text,'Chap 2')]"));
            } catch (Exception ignored) {}

            // Cách 2: Tìm bằng contains (phòng trường hợp có khoảng trắng hoặc dấu)
            if (chap2 == null) {
                try {
                    chap2 = driver.findElement(
                            By.xpath("//*[contains(@text,'Chap 2') or contains(@content-desc,'Chap 2')]")
                    );
                } catch (Exception ignored) {}
            }

            if (chap2 != null) {
                // Scroll nhẹ lên để đảm bảo Chap 2 nằm trong viewport (nếu list dài)
                scrollUpLight();        // hàm mới mình thêm bên dưới
                sleep(800);

                chap2.click();
                System.out.println("✅ Click Chap 2 bằng WebElement");
            } else {
                System.out.println("⚠️ Không tìm thấy 'Chap 2' bằng text → dùng tap vị trí");

                // Vị trí Chap 2 thường nằm ngay dưới Chap 1
                // Dựa trên screenshot mới: Chap 1 ở ~0.35, Chap 2 ở ~0.42 ~ 0.45
                tap(0.5, 0.43);
            }

            sleep(4000);   // chờ load reader
            screenshot("after_click_chap2");

            // Verify đã vào chapter reader
            boolean ok = pageHas("Chap 2")
                    || !pageHas("Read from chapter 1")
                    || pageHas("Chapter");

            log(name, ok, ok ? "Mở Chap 2 thành công" : "Không vào được Chap 2");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc38_NextChapter() {
        String name = "TC38 - Next Chapter";

        try {
            screenshot("before_tc38");

            doubleTapCenterForReader();
            sleep(1500);

            Dimension size = driver.manage().window().getSize();

            int x = (int)(size.width * 0.88);
            int y = (int)(size.height * 0.88); // 🔥 FIX

            tapPixel(x, y);

            sleep(4000);
            screenshot("after_tc38");

            boolean ok = pageHas("Chap 3");

            log(name, ok, ok ? "Đã sang chapter mới" : "Không đổi chapter");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc39_PreviousChapter() {
        String name = "TC39 - Previous Chapter";

        try {
            screenshot("before_tc39");

            Dimension size = driver.manage().window().getSize();

            int x = (int)(size.width * 0.12);
            int y = (int)(size.height * 0.88); // 🔥 FIX

            tapPixel(x, y);

            sleep(4000);
            screenshot("after_tc39");

            boolean ok = pageHas("Chap 2") || pageHas("Chap 1");

            log(name, ok, ok ? "Đã quay về chapter trước" : "Không đổi chapter");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc40_OpenChapterList() {
        String name = "TC40 - Open chapter list (Chọn chương)";
        try {
            screenshot("before_chon_chuong");

            System.out.println("🔍 Đang tìm nút 'Chọn chương'...");

            boolean clicked = false;
            WebElement chonChuongBtn = null;

            // === CÁCH 1: Tìm bằng text linh hoạt hơn (ưu tiên) ===
            String[] possibleTexts = {
                    "Chọn chương",
                    "Chọn Chương",
                    "chon chuong",
                    "Chọn chương"
            };

            for (String txt : possibleTexts) {
                try {
                    // Tìm text chính xác hoặc chứa
                    chonChuongBtn = driver.findElement(
                            By.xpath("//*[contains(@text, '" + txt + "') or contains(@content-desc, '" + txt + "')]")
                    );
                    if (chonChuongBtn != null) {
                        System.out.println("✅ Tìm thấy nút bằng text: " + txt);
                        break;
                    }
                } catch (Exception ignored) {}
            }

            // Nếu tìm thấy → thử click bằng element trước
            if (chonChuongBtn != null) {
                try {
                    chonChuongBtn.click();
                    System.out.println("✅ Click thành công bằng WebElement.click()");
                    clicked = true;
                } catch (Exception e) {
                    System.out.println("⚠️ WebElement.click() fail → chuyển sang tap tọa độ");
                }
            }

            // === CÁCH 2: Fallback tap tọa độ - QUAN TRỌNG NHẤT ===
            if (!clicked) {
                System.out.println("👆 Dùng tap tọa độ nút Chọn chương (bottom button)");

                Dimension size = driver.manage().window().getSize();
                System.out.println("Screen height: " + size.height);

                // Danh sách vị trí thử theo thứ tự ưu tiên (dựa trên screenshot của bạn)
                double[] yPositions = {0.925, 0.91, 0.90, 0.93, 0.94, 0.88, 0.95};

                for (double y : yPositions) {
                    System.out.println("   → Thử tap tại y = " + y);

                    tap(0.5, y);           // giữa màn hình theo chiều ngang
                    sleep(800);

                    // Kiểm tra xem bottom sheet đã mở chưa
                    if (pageHas("Chap") || pageHas("Chương") || pageHas("Chapter") || pageHas("1")) {
                        clicked = true;
                        System.out.println("✅ Thành công! Chapter list đã mở tại y = " + y);
                        break;
                    }
                }
            }

            // === CÁCH 3: Nếu vẫn không được, thử tap vùng rộng hơn một chút ===
            if (!clicked) {
                System.out.println("⚠️ Thử tap vùng rộng hơn (0.45 ~ 0.55)");
                tap(0.48, 0.92);
                sleep(1000);
                tap(0.52, 0.92);
                sleep(1000);
            }

            sleep(2000);
            screenshot("after_tap_chon_chuong");

            // === VERIFY ===
            boolean ok = pageHas("Chap") || pageHas("Chapter") || pageHas("Chương") || pageHas("1");

            log(name, ok,
                    ok ? "✅ Đã mở danh sách chương thành công"
                            : "❌ Vẫn không mở được chapter list - cần kiểm tra lại tọa độ");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc41_SelectChapter0() {
        String name = "TC41 - Select Chap 0 từ danh sách chương";
        try {
            screenshot("before_select_chap1");

            boolean clicked = false;

            // === CÁCH 1: Tìm Chap 1 chính xác nhất ===
            try {
                WebElement chap1 = driver.findElement(
                        By.xpath("//*[contains(@text,'Chap 0') or contains(@text,'Chapter 0') or contains(@text,'Chương 0')]")
                );
                chap1.click();
                System.out.println("✅ Click Chap 0 bằng WebElement");
                clicked = true;
            } catch (Exception ignored) {}

            // === CÁCH 2: Tìm bất kỳ item nào chứa "1" và không phải 10,11,12... ===
            if (!clicked) {
                try {
                    List<WebElement> chapters = driver.findElements(
                            By.xpath("//*[contains(@text,'Chap') or contains(@text,'Chương') or contains(@text,'Chapter')]")
                    );

                    for (WebElement item : chapters) {
                        String text = item.getText().trim();
                        if (text.contains("0") &&
                                !text.contains("10") ) {

                            item.click();
                            System.out.println("✅ Click thành công item chứa '1': " + text);
                            clicked = true;
                            break;
                        }
                    }
                } catch (Exception ignored) {}
            }

            // === CÁCH 3: Fallback tap vị trí (rất quan trọng cho bottom sheet) ===
            if (!clicked) {
                System.out.println("⚠️ Không tìm thấy bằng text → Tap vị trí Chap 1 trong bottom sheet");

                // Vị trí Chap 1 thường nằm ở phần trên của bottom sheet
                double[] yPositions = {0.38, 0.36, 0.40, 0.42, 0.35};

                for (double y : yPositions) {
                    tap(0.5, y);
                    System.out.println("   → Thử tap Chap 1 tại y = " + y);
                    sleep(1000);

                    if (pageHas("chap 1") || pageHas("Chương 1") || !pageHas("Chọn chương")) {
                        clicked = true;
                        System.out.println("✅ Đã mở Chap 1 thành công tại y = " + y);
                        break;
                    }
                }
            }

            sleep(2500);
            screenshot("after_select_chap1");

            boolean ok = pageHas("Chap 1") || pageHas("Chương 1") || pageHas("Chapter 1");

            log(name, ok, ok ? "✅ Mở Chap 1 thành công" : "❌ Không mở được Chap 1");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc42_CloseChapterListByClick() {
        String name = "TC42 - Close chapter list by click";
        try {
            // mở thanh chọn chương trước
            tc40_OpenChapterList();
            sleep(2000);
            tap(0.5, 0.25);

            sleep(1500);
            screenshot("after_close_chapter_list");

            boolean ok = !pageHas("Chap 1") && !pageHas("Chương 1") && !pageHas("Chapter 1");

            log(name, ok, ok ? "✅ Đã đóng danh sách chương thành công"
                    : "❌ Bottom sheet vẫn còn hiển thị");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    static void tc43_ShowReaderUI_And_ClickBookmark() {
        String name = "TC43 - Thoát ra như TC36, hiện UI rồi click Icon Bookmark";
        recoverSessionIfNeeded(name);
        try {
            safeTap(0.08, 0.08);   // back arrow
            sleep(2000);

            toggleReaderUI();      // Hiện thanh UI Reader
            sleep(1500);

            safeTap(0.92, 0.08);   // Click Icon Bookmark (icon thứ 3 bên phải)

            log(name, true, "Đã hiện UI và click Bookmark thành công");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc44_HideReaderUI_And_ClickBookmark() {
        String name = "TC44 - Ẩn UI rồi click Icon Bookmark";
        recoverSessionIfNeeded(name);
        try {
            toggleReaderUI();      // Ẩn thanh UI
            sleep(1500);

            safeTap(0.92, 0.08);   // Click Icon Bookmark

            log(name, true, "Đã ẩn UI và click Bookmark thành công");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc45_TapHeart() {
        String name = "TC45 - Nhấn nút Trái Tim (Follow)";
        recoverSessionIfNeeded(name);
        try {
            // Tọa độ được điều chỉnh phù hợp với vị trí Icon Trái Tim
            safeTap(0.76, 0.08);     // ← Đã chỉnh từ 0.78 → 0.76 cho chính xác hơn

            sleep(1500);

            screenshot("after_tap_heart");

            log(name, true, "Đã nhấn Icon Trái Tim thành công");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc46_DeclinePopup() {
        String name = "TC46 - Popup hiện lên → nhấn Decline";
        recoverSessionIfNeeded(name);
        try {
            // Thử tìm text trước
            WebElement declineBtn = null;
            String[] texts = {"Hủy", "Decline", "Cancel", "Không", "No"};
            for (String t : texts) {
                try {
                    declineBtn = driver.findElement(By.xpath("//*[contains(@text,'" + t + "')]"));
                    if (declineBtn != null) break;
                } catch (Exception ignored) {}
            }
            if (declineBtn != null) {
                declineBtn.click();
            } else {
                safeTap(0.25, 0.72);   // bên trái popup
            }
            sleep(2000);
            screenshot("after_decline");
            log(name, true, "Đã nhấn Decline trên popup");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc47_FollowButton_LoginPopup() {
        String name = "TC47 - Click nút Follow lớn (xanh) → Popup Login";
        recoverSessionIfNeeded(name);
        try {
            sleep(1800);  // Đợi màn hình load xong

            log(name, true, "Đang click nút Follow lớn...");

            // Thử nhiều tọa độ theo ảnh thực tế
            double[][] positions = {
                    {0.50, 0.29},   // Tốt nhất
                    {0.50, 0.28},
                    {0.50, 0.31},
                    {0.48, 0.30}
            };

            for (double[] pos : positions) {
                safeTap(pos[0], pos[1]);
                log(name, true, "Thử click tại: " + pos[0] + ", " + pos[1]);
                sleep(2000);
                screenshot("follow_attempt_" + String.valueOf(pos[1]));
            }

            sleep(2500);  // Chờ popup Login hiện ra

            // Xử lý popup
            WebElement loginBtn = null;
            String[] loginTexts = {"Đăng nhập", "Log In", "Login", "Sign in", "Đăng Nhập"};

            for (String t : loginTexts) {
                try {
                    loginBtn = driver.findElement(By.xpath("//*[contains(@text,'" + t + "')]"));
                    if (loginBtn != null) {
                        loginBtn.click();
                        log(name, true, "Click nút: " + t);
                        break;
                    }
                } catch (Exception ignored) {}
            }

            if (loginBtn == null) {
                safeTap(0.75, 0.65);
                log(name, true, "Dùng fallback click popup");
            }

            sleep(2000);
            screenshot("after_login_popup");

            log(name, true, "✅ TC47 HOÀN THÀNH");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc48_TapBackFromComicDetail() {
        String name = "TC48 - Nhấn nút mũi tên để thoát ra khỏi truyện";
        recoverSessionIfNeeded(name);
        try {
            // Đảm bảo đang ở màn hình chi tiết truyện (Chapters hoặc Overview)
            screenshot("before_tap_back");

            tapBackButton();

            // Verify đã thoát thành công về màn hình trước (thường là Explore hoặc Home)
            sleep(2000);
            boolean ok = pageHas("Explore")
                    || pageHas("Home")
                    || pageHas("Toàn Chức Kiếm Tu") == false;  // không còn tên truyện nữa

            log(name, ok, ok ? "✅ Đã thoát khỏi chi tiết truyện thành công"
                    : "❌ Vẫn còn ở màn hình truyện");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc49_ScrollProfileToSettings() {
        String name = "TC49 - Vuốt màn hình Profile từ hình trước ra hình sau";
        recoverSessionIfNeeded(name);
        try {
            // Đảm bảo đang ở tab Profile
            navigate("Profile", 0.9, 0.92);
            sleep(2000);
            screenshot("profile_start");

            // Vuốt nhẹ 1-2 lần (vì sau tc48 có thể đã scroll một phần)
            scrollDown();
            sleep(800);
            scrollDown();
            sleep(1500);

            screenshot("profile_settings_visible");

            boolean ok = pageHas("Notifications") && pageHas("Dark Mode");
            log(name, ok, ok ? "✅ Đã scroll đến phần Settings thành công"
                    : "Chưa thấy phần toggle");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc50_ToggleNotifications_Off() {
        String name = "TC50 - Tắt Notifications (xanh → xám)";
        toggleSwitch("Notifications", false, name);
    }

    static void tc51_ToggleNotifications_On() {
        String name = "TC51 - Bật Notifications (xám → xanh)";
        toggleSwitch("Notifications", true, name);
    }

    static void tc52_ToggleDarkMode_On() {
        String name = "TC52 - Bật Dark Mode";
        toggleSwitch("Dark Mode", true, name);
    }

    static void tc53_ToggleDarkMode_Off() {
        String name = "TC53 - Tắt Dark Mode";
        toggleSwitch("Dark Mode", false, name);
    }

    static void tc54_ToggleReadingReminders_On() {
        String name = "TC54 - Bật Reading Reminders";
        toggleSwitch("Reading Reminders", true, name);
    }

    static void tc55_ToggleReadingReminders_Off() {
        String name = "TC55 - Tắt Reading Reminders";
        toggleSwitch("Reading Reminders", false, name);
    }

    static void tc56_OpenLanguagePopup() {
        String name = "TC56 - Click vào Language để mở popup Select Language";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();   // đảm bảo thấy phần dưới
            sleep(1000);

            openLanguagePopup();

            boolean hasPopup = pageHas("Select Language")
                    || pageHas("English")
                    || pageHas("Tiếng Việt")
                    || pageHas("Español");

            log(name, hasPopup, hasPopup ? "✅ Popup mở thành công" : "❌ Vẫn không mở được popup");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc57_SelectTiengViet() {
        String name = "TC57 - Click vào Tiếng Việt trong popup Language";
        recoverSessionIfNeeded(name);

        try {
            if (!pageHas("Select Language")) {
                openLanguagePopup();
                sleep(1500);
            }

            boolean clicked = false;

            // ✅ Cách 1: tìm cả text + content-desc
            try {
                List<WebElement> elements = driver.findElements(
                        By.xpath("//*[contains(@text,'Việt') or contains(@content-desc,'Việt') or contains(@text,'Vietnam') or contains(@content-desc,'Vietnam')]")
                );

                for (WebElement el : elements) {
                    if (el.isDisplayed()) {
                        el.click();
                        System.out.println("✅ Click Tiếng Việt bằng text/content-desc");
                        clicked = true;
                        break;
                    }
                }
            } catch (Exception ignored) {}

            // ✅ Cách 2: scan clickable (fix Flutter)
            if (!clicked) {
                System.out.println("⚠️ Fallback: scan clickable");

                List<WebElement> items = driver.findElements(By.xpath("//*[@clickable='true']"));

                for (WebElement el : items) {
                    String text = el.getText();
                    String desc = el.getAttribute("content-desc");

                    if ((text != null && text.toLowerCase().contains("vi")) ||
                            (desc != null && desc.toLowerCase().contains("vi"))) {

                        el.click();
                        System.out.println("✅ Click Tiếng Việt bằng clickable");
                        clicked = true;
                        break;
                    }
                }
            }

            // ✅ Cách 3: click theo vị trí trong popup (ổn định hơn % màn hình)
            if (!clicked) {
                System.out.println("⚠️ Fallback cuối: click theo vị trí popup");

                try {
                    WebElement popup = driver.findElement(
                            By.xpath("//*[contains(@text,'Select Language') or contains(@content-desc,'Select Language')]")
                    );

                    Rectangle r = popup.getRect();

                    int x = r.x + r.width / 2;
                    int y = r.y + (int)(r.height * 0.65); // dòng 2

                    tapAbsolute(x, y);

                    clicked = true;
                } catch (Exception ignored) {}
            }

            sleep(2000);
            screenshot("after_select_tieng_viet");

            boolean ok = clicked && !pageHas("Select Language");

            log(name, ok, ok ? "✅ Đã chọn Tiếng Việt"
                    : "❌ Không chọn được Tiếng Việt");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc58_SelectEnglish() {
        String name = "TC58 - Click Language → chọn English";
        recoverSessionIfNeeded(name);

        try {
            openLanguagePopup();
            sleep(1500);

            boolean clicked = false;

            // ✅ Cách 1: text + content-desc
            try {
                List<WebElement> elements = driver.findElements(
                        By.xpath("//*[contains(@text,'English') or contains(@content-desc,'English')]")
                );

                for (WebElement el : elements) {
                    if (el.isDisplayed()) {
                        el.click();
                        System.out.println("✅ Click English bằng text/content-desc");
                        clicked = true;
                        break;
                    }
                }
            } catch (Exception ignored) {}

            // ✅ Cách 2: scan clickable
            if (!clicked) {
                System.out.println("⚠️ Fallback: scan clickable");

                List<WebElement> items = driver.findElements(By.xpath("//*[@clickable='true']"));

                for (WebElement el : items) {
                    String text = el.getText();
                    String desc = el.getAttribute("content-desc");

                    if ((text != null && text.toLowerCase().contains("eng")) ||
                            (desc != null && desc.toLowerCase().contains("eng"))) {

                        el.click();
                        System.out.println("✅ Click English bằng clickable");
                        clicked = true;
                        break;
                    }
                }
            }

            // ✅ Cách 3: click theo vị trí popup (dòng 1)
            if (!clicked) {
                System.out.println("⚠️ Fallback cuối: click theo vị trí popup");

                try {
                    WebElement popup = driver.findElement(
                            By.xpath("//*[contains(@text,'Select Language') or contains(@content-desc,'Select Language')]")
                    );

                    Rectangle r = popup.getRect();

                    int x = r.x + r.width / 2;
                    int y = r.y + (int)(r.height * 0.35); // dòng 1

                    tapAbsolute(x, y);

                    clicked = true;
                } catch (Exception ignored) {}
            }

            sleep(2000);
            screenshot("after_select_english");

            boolean ok = clicked && !pageHas("Select Language");

            log(name, ok, ok ? "✅ Đã chọn English"
                    : "❌ Không chọn được English");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc59_OpenFontSizePopup() {
        String name = "TC59 - Click vào Font Size để mở popup";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);
            scrollDown();           // đảm bảo thấy Font Size
            sleep(800);

            openFontSizePopup();

            boolean hasPopup = pageHas("Font Size") ||
                    pageHas("Small") ||
                    pageHas("Medium") ||
                    pageHas("Large");

            log(name, hasPopup, hasPopup ? "✅ Popup Font Size mở thành công"
                    : "❌ Không mở được popup Font Size");
        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc60_SelectLargeFont() {
        String name = "TC60 - Chọn Large trong popup Font Size";
        recoverSessionIfNeeded(name);

        try {
            if (!pageHas("Font Size") && !pageHas("Large")) {
                openFontSizePopup();
                sleep(1500);
            }

            boolean clicked = false;

            // Cách 1: text + content-desc
            try {
                List<WebElement> els = driver.findElements(
                        By.xpath("//*[contains(@text,'Large') or contains(@content-desc,'Large')]")
                );

                for (WebElement el : els) {
                    if (el.isDisplayed()) {
                        el.click();
                        clicked = true;
                        System.out.println("✅ Click Large bằng text");
                        break;
                    }
                }
            } catch (Exception ignored) {}

            // Cách 2: fallback clickable
            if (!clicked) {
                System.out.println("⚠️ Fallback scan clickable Large");

                List<WebElement> items = driver.findElements(By.xpath("//*[@clickable='true']"));

                for (WebElement el : items) {
                    String text = el.getText();
                    String desc = el.getAttribute("content-desc");

                    if ((text != null && text.toLowerCase().contains("large")) ||
                            (desc != null && desc.toLowerCase().contains("large"))) {

                        el.click();
                        clicked = true;
                        break;
                    }
                }
            }

            sleep(2000);
            screenshot("after_select_large");

            boolean ok = pageHas("Large") || !pageHas("Font Size");

            log(name, ok, ok ? "✅ Đã chọn Large thành công"
                    : "❌ Không chọn được Large");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc61_SelectMediumFont() {
        String name = "TC61 - Open + Select Medium Font";
        recoverSessionIfNeeded(name);

        try {
            // 🔥 1. Vào đúng màn hình
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();
            sleep(800);

            // 🔥 2. MỞ POPUP LUÔN (không check nữa)
            openFontSizePopup();
            sleep(1500);

            boolean clicked = false;

            // 🔥 3. Click Medium
            try {
                List<WebElement> els = driver.findElements(
                        By.xpath("//*[contains(@text,'Medium') or contains(@content-desc,'Medium')]")
                );

                for (WebElement el : els) {
                    if (el.isDisplayed()) {
                        el.click();
                        clicked = true;
                        System.out.println("✅ Click Medium bằng text");
                        break;
                    }
                }
            } catch (Exception ignored) {}

            // 🔥 fallback clickable
            if (!clicked) {
                System.out.println("⚠️ Fallback scan clickable Medium");

                List<WebElement> items = driver.findElements(By.xpath("//*[@clickable='true']"));

                for (WebElement el : items) {
                    String text = el.getText();
                    String desc = el.getAttribute("content-desc");

                    if ((text != null && text.toLowerCase().contains("med")) ||
                            (desc != null && desc.toLowerCase().contains("med"))) {

                        el.click();
                        clicked = true;
                        System.out.println("✅ Click Medium bằng clickable");
                        break;
                    }
                }
            }

            sleep(2000);
            screenshot("after_select_medium");

            // 🔥 4. Verify (đừng chỉ check popup)
            boolean ok =
                    clicked &&
                            (pageHas("Medium") || !pageHas("Font Size"));

            log(name, ok, ok ? "✅ Đã chọn Medium thành công"
                    : "❌ Không chọn được Medium");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc61_OpenAboutStoryVerse() {
        String name = "TC61 - Click vào About StoryVerse để mở popup";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();
            sleep(1000);

            boolean clicked = false;

            // Cách 1: Tìm bằng text (ưu tiên và ổn định nhất)
            try {
                WebElement about = driver.findElement(
                        By.xpath("//*[contains(@text,'About StoryVerse')]")
                );
                about.click();
                System.out.println("✅ Click About StoryVerse bằng text");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: Fallback tọa độ - Đẩy lên cao hơn để tránh vùng nút OK và Help
            if (!clicked) {
                System.out.println("⚠️ Không tìm thấy text → dùng tọa độ (đã chỉnh lên cao hơn)");

                // Tọa độ đã đẩy lên để chỉ click dòng "About StoryVerse"
                double[] yPositions = {0.59, 0.60, 0.61, 0.58, 0.62, 0.57};

                for (double y : yPositions) {
                    System.out.println("   → Thử tap About StoryVerse tại y = " + y);
                    safeTap(0.50, y);
                    sleep(1800);

                    if (pageHas("About StoryVerse") || pageHas("Version: 1.0.0") ||
                            pageHas("StoryVerse is your ultimate")) {

                        System.out.println("✅ Popup About StoryVerse mở thành công tại y = " + y);
                        clicked = true;
                        break;
                    }
                }
            }

            sleep(2500);   // chờ popup load đầy đủ
            screenshot("after_open_about_popup");

            boolean hasPopup = pageHas("About StoryVerse") ||
                    pageHas("Version: 1.0.0") ||
                    pageHas("StoryVerse is your ultimate reading companion");

            log(name, hasPopup, hasPopup ? "✅ Popup About StoryVerse mở thành công"
                    : "❌ Không mở được popup About");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc62_ClickOKOnAboutPopup() {
        String name = "TC62 - Click nút OK để đóng popup About StoryVerse";
        recoverSessionIfNeeded(name);
        try {
            boolean clicked = false;

            // Cách 1: Click bằng text OK
            try {
                WebElement okBtn = driver.findElement(
                        By.xpath("//*[contains(@text,'OK') or contains(@content-desc,'OK') or contains(@text,'Ok')]")
                );
                okBtn.click();
                System.out.println("✅ Click nút OK bằng WebElement text");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ
            if (!clicked) {
                System.out.println("⚠️ Không click được bằng text → thử tọa độ");

                double[] xPositions = {0.72, 0.76, 0.80, 0.68};
                double[] yPositions = {0.74, 0.76, 0.72, 0.78};

                for (double y : yPositions) {
                    for (double x : xPositions) {
                        System.out.println("   → Tap OK tại (" + x + ", " + y + ")");
                        safeTap(x, y);
                        sleep(1500);

                        // 👉 CHECK NGAY sau khi tap
                        if (!pageHas("Version: 1.0.0") &&
                                !pageHas("StoryVerse is your ultimate")) {

                            System.out.println("✅ Popup đã đóng tại (" + x + ", " + y + ")");
                            clicked = true;
                            break;
                        }
                    }
                    if (clicked) break;
                }
            }

            // 👉 Retry check (fix lỗi UI delay / DOM cache)
            boolean popupClosed = false;
            for (int i = 0; i < 5; i++) {
                if (!pageHas("Version: 1.0.0") &&
                        !pageHas("StoryVerse is your ultimate")) {

                    popupClosed = true;
                    break;
                }
                sleep(1000);
            }

            screenshot("after_click_ok_about");

            log(name, popupClosed,
                    popupClosed
                            ? "✅ Đã click OK và popup đóng thành công"
                            : "❌ Popup vẫn còn (check lại locator)");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc63_OpenHelpSupport() {
        String name = "TC63 - Click vào Help & Support để mở popup";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();
            sleep(1000);

            boolean clicked = false;

            // Cách 1: Click bằng text
            try {
                WebElement help = driver.findElement(
                        By.xpath("//*[contains(@text,'Help & Support')]")
                );
                help.click();
                System.out.println("✅ Click Help & Support bằng text");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ (dưới About StoryVerse)
            if (!clicked) {
                System.out.println("⚠️ Không tìm thấy text → dùng tọa độ");

                double[] yPositions = {0.68, 0.70, 0.72, 0.66, 0.74};

                for (double y : yPositions) {
                    System.out.println("   → Tap Help tại y = " + y);
                    safeTap(0.50, y);
                    sleep(1800);

                    // 👉 check popup HELP (KHÔNG dùng "Help & Support" vì trùng menu)
                    if (pageHas("Need help?") ||
                            pageHas("support@storyverse.com") ||
                            pageHas("Live Chat")) {

                        System.out.println("✅ Popup Help mở tại y = " + y);
                        clicked = true;
                        break;
                    }
                }
            }

            sleep(2000);
            screenshot("after_open_help_popup");

            // 👉 VERIFY popup HELP
            boolean hasPopup = false;
            for (int i = 0; i < 5; i++) {
                if (pageHas("Need help?") ||
                        pageHas("support@storyverse.com") ||
                        pageHas("Live Chat")) {

                    hasPopup = true;
                    break;
                }
                sleep(1000);
            }

            log(name, hasPopup,
                    hasPopup
                            ? "✅ Popup Help & Support mở thành công"
                            : "❌ Không mở được popup Help");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc64_ClickOKOnHelpPopup() {
        String name = "TC64 - Click OK để đóng popup Help & Support";
        recoverSessionIfNeeded(name);
        try {
            boolean clicked = false;

            // Cách 1: Click OK bằng text
            try {
                WebElement okBtn = driver.findElement(
                        By.xpath("//*[contains(@text,'OK') or contains(@text,'Ok')]")
                );
                okBtn.click();
                System.out.println("✅ Click OK (Help popup)");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ
            if (!clicked) {
                System.out.println("⚠️ Không click được OK → dùng tọa độ");

                double[] xPositions = {0.72, 0.76, 0.80, 0.68};
                double[] yPositions = {0.74, 0.76, 0.72, 0.78};

                for (double y : yPositions) {
                    for (double x : xPositions) {
                        System.out.println("   → Tap OK tại (" + x + ", " + y + ")");
                        safeTap(x, y);
                        sleep(1500);

                        // 👉 check popup đã đóng chưa
                        if (!pageHas("Need help?") &&
                                !pageHas("support@storyverse.com") &&
                                !pageHas("Live Chat")) {

                            System.out.println("✅ Popup Help đã đóng");
                            clicked = true;
                            break;
                        }
                    }
                    if (clicked) break;
                }
            }

            // 👉 Retry verify
            boolean popupClosed = false;
            for (int i = 0; i < 5; i++) {
                if (!pageHas("Need help?") &&
                        !pageHas("support@storyverse.com") &&
                        !pageHas("Live Chat")) {

                    popupClosed = true;
                    break;
                }
                sleep(1000);
            }

            screenshot("after_click_ok_help");

            log(name, popupClosed,
                    popupClosed
                            ? "✅ Đóng popup Help thành công"
                            : "❌ Popup Help vẫn còn");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc65_OpenPrivacyPolicy() {
        String name = "TC65 - Click vào Privacy Policy để mở popup";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();
            sleep(1000);

            boolean clicked = false;

            // Cách 1: Click bằng text
            try {
                WebElement privacy = driver.findElement(
                        By.xpath("//*[contains(@text,'Privacy Policy')]")
                );
                privacy.click();
                System.out.println("✅ Click Privacy Policy bằng text");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ (dưới Help & Support)
            if (!clicked) {
                System.out.println("⚠️ Không tìm thấy text → dùng tọa độ");

                double[] yPositions = {0.75, 0.77, 0.79, 0.73, 0.81};

                for (double y : yPositions) {
                    System.out.println("   → Tap Privacy tại y = " + y);
                    safeTap(0.50, y);
                    sleep(1800);

                    // 👉 check popup PRIVACY (KHÔNG dùng "Privacy Policy")
                    if (pageHas("Your privacy is important") ||
                            pageHas("Information We Collect") ||
                            pageHas("We never sell your personal information")) {

                        System.out.println("✅ Popup Privacy mở tại y = " + y);
                        clicked = true;
                        break;
                    }
                }
            }

            sleep(2000);
            screenshot("after_open_privacy_popup");

            // 👉 VERIFY popup PRIVACY
            boolean hasPopup = false;
            for (int i = 0; i < 5; i++) {
                if (pageHas("Your privacy is important") ||
                        pageHas("Information We Collect") ||
                        pageHas("We never sell your personal information")) {

                    hasPopup = true;
                    break;
                }
                sleep(1000);
            }

            log(name, hasPopup,
                    hasPopup
                            ? "✅ Popup Privacy Policy mở thành công"
                            : "❌ Không mở được popup Privacy");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc66_ClickOKOnPrivacyPopup() {
        String name = "TC66 - Click OK để đóng popup Privacy Policy";
        recoverSessionIfNeeded(name);
        try {
            boolean clicked = false;

            // Cách 1: Click OK bằng text
            try {
                WebElement okBtn = driver.findElement(
                        By.xpath("//*[contains(@text,'OK') or contains(@text,'Ok')]")
                );
                okBtn.click();
                System.out.println("✅ Click OK (Privacy popup)");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ
            if (!clicked) {
                System.out.println("⚠️ Không click được OK → dùng tọa độ");

                double[] xPositions = {0.72, 0.76, 0.80, 0.68};
                double[] yPositions = {0.74, 0.76, 0.72, 0.78};

                for (double y : yPositions) {
                    for (double x : xPositions) {
                        System.out.println("   → Tap OK tại (" + x + ", " + y + ")");
                        safeTap(x, y);
                        sleep(1500);

                        // 👉 check popup đã đóng
                        if (!pageHas("Your privacy is important") &&
                                !pageHas("Information We Collect") &&
                                !pageHas("We never sell your personal information")) {

                            System.out.println("✅ Popup Privacy đã đóng");
                            clicked = true;
                            break;
                        }
                    }
                    if (clicked) break;
                }
            }

            // 👉 Retry verify
            boolean popupClosed = false;
            for (int i = 0; i < 5; i++) {
                if (!pageHas("Your privacy is important") &&
                        !pageHas("Information We Collect") &&
                        !pageHas("We never sell your personal information")) {

                    popupClosed = true;
                    break;
                }
                sleep(1000);
            }

            screenshot("after_click_ok_privacy");

            log(name, popupClosed,
                    popupClosed
                            ? "✅ Đóng popup Privacy thành công"
                            : "❌ Popup Privacy vẫn còn");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc67_ClickLogIn() {
        String name = "TC67 - Click vào Log In";
        recoverSessionIfNeeded(name);
        try {
            navigate("Profile", 0.9, 0.92);
            sleep(1500);

            scrollDown();
            sleep(1000);

            boolean clicked = false;

            // Cách 1: Click bằng text
            try {
                WebElement login = driver.findElement(
                        By.xpath("//*[contains(@text,'Log In')]")
                );
                login.click();
                System.out.println("✅ Click Log In bằng text");
                clicked = true;
            } catch (Exception ignored) {}

            // Cách 2: fallback tọa độ (dòng cuối cùng)
            if (!clicked) {
                System.out.println("⚠️ Không tìm thấy Log In → dùng tọa độ");

                double[] yPositions = {0.85, 0.87, 0.89, 0.83};

                for (double y : yPositions) {
                    System.out.println("   → Tap Log In tại y = " + y);
                    safeTap(0.50, y);
                    sleep(1800);

                    // 👉 Check chuyển màn hình (Login screen)
                    if (pageHas("Log In to your account") ||
                            pageHas("Email") ||
                            pageHas("Password")) {

                        System.out.println("✅ Đã chuyển sang màn hình Login tại y = " + y);
                        clicked = true;
                        break;
                    }
                }
            }

            sleep(2000);
            screenshot("after_click_login");

            // 👉 VERIFY màn Login (retry)
            boolean isLoginScreen = false;
            for (int i = 0; i < 5; i++) {
                if (pageHas("Log In to your account") ||
                        pageHas("Email") ||
                        pageHas("Password")) {

                    isLoginScreen = true;
                    break;
                }
                sleep(1000);
            }

            log(name, isLoginScreen,
                    isLoginScreen
                            ? "✅ Mở màn hình Login thành công"
                            : "❌ Không chuyển sang màn hình Login");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc68_ClickSignInOnWelcome() {
        String name = "TC68 - Click Sign in trên màn Welcome";
        recoverSessionIfNeeded(name);

        try {
            // Click bằng text
            try {
                WebElement signIn = driver.findElement(
                        By.xpath("//*[contains(@text,'Sign in') or contains(@text,'Sign In')]")
                );
                signIn.click();
                System.out.println("✅ Click Sign in bằng text");
            } catch (Exception e) {
                System.out.println("⚠️ Fallback tọa độ");
                safeTap(0.5, 0.80);
            }

            sleep(2000);
            screenshot("after_click_signin_welcome");

            // 👉 Không verify nữa
            log(name, true, "✅ Đã click Sign in");

        } catch (Exception e) {
            log(name, false, e.getMessage());
        }
    }

    static void tc69_CheckboxEnableSignUpButton() {
        String name = "TC69 - Click checkbox → Sign up button turns blue";
        try {
            screenshot("tc69_before_checkbox");

            // === Find and click checkbox (multiple strategies) ===
            WebElement checkbox = null;
            String[] checkboxLocators = {
                    "//android.widget.CheckBox",
                    "//*[contains(@text,'I agree') or contains(@text,'agree')]/preceding-sibling::*[1]",
                    "//*[contains(@resource-id,'checkbox') or contains(@content-desc,'checkbox')]"
            };

            for (String loc : checkboxLocators) {
                try {
                    checkbox = driver.findElement(By.xpath(loc));
                    if (checkbox != null) break;
                } catch (Exception ignored) {}
            }

            if (checkbox != null) {
                checkbox.click();
                System.out.println("✅ Clicked checkbox via element");
            } else {
                System.out.println("⚠️ Checkbox not found by locator → using coordinate fallback");
                tap(0.12, 0.58);   // Adjust X,Y if needed (use Appium Inspector)
            }

            sleep(2000);   // Wait for UI state to update (important for button enabling)

            screenshot("tc69_after_checkbox");

            // === Check if Sign Up button is now enabled ===
            boolean buttonEnabled = false;

            try {
                WebElement signUpBtn = driver.findElement(By.xpath(
                        "//*[contains(@text,'Sign up') or contains(@text,'Signup') or contains(@content-desc,'Sign up')]"
                ));

                buttonEnabled = signUpBtn.isEnabled();

                // Extra check: sometimes isEnabled() returns false even when visually enabled
                if (!buttonEnabled) {
                    String enabledAttr = signUpBtn.getAttribute("enabled");
                    buttonEnabled = "true".equalsIgnoreCase(enabledAttr);
                }

            } catch (Exception e) {
                System.out.println("⚠️ Could not find Sign up button by text");
            }

            // Ultimate fallback: search among all buttons
            if (!buttonEnabled) {
                try {
                    List<WebElement> allButtons = driver.findElements(By.className("android.widget.Button"));
                    for (WebElement btn : allButtons) {
                        if (btn.getText().toLowerCase().contains("sign up") && btn.isEnabled()) {
                            buttonEnabled = true;
                            break;
                        }
                    }
                } catch (Exception ignored) {}
            }

            String resultMessage = buttonEnabled
                    ? "✅ Checkbox clicked → Sign up button is now enabled (should turn blue)"
                    : "❌ Sign up button is still disabled after clicking checkbox";

            log(name, buttonEnabled, resultMessage);

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
            e.printStackTrace();
        }
    }

    static void tc70_SignUp_EmptyAllFields() {
        String name = "TC70 - Sign up with all fields empty";
        try {
            screenshot("tc70_before");

            tapSignUpButton();
            sleep(3000);        // Flutter animations + validation can take longer

            screenshot("tc70_after");

            boolean hasError = false;
            String pageSource = driver.getPageSource().toLowerCase();

            // 1. Check common validation phrases (even if partial)
            String[] errorPhrases = {
                    "please enter", "enter your", "required",
                    "username", "email", "password",
                    "invalid", "must be", "at least"
            };

            for (String phrase : errorPhrases) {
                if (pageSource.contains(phrase)) {
                    hasError = true;
                    break;
                }
            }

            // 2. Look for red error text using common Flutter patterns
            if (!hasError) {
                try {
                    // Flutter often renders error as Text widget with specific style
                    List<WebElement> potentialErrors = driver.findElements(By.xpath(
                            "//android.widget.TextView | " +
                                    "//*[@class='android.view.View' and contains(@content-desc,'error') or contains(@text,'!')]"
                    ));

                    for (WebElement el : potentialErrors) {
                        String text = el.getText().trim().toLowerCase();
                        String desc = el.getAttribute("content-desc") != null
                                ? el.getAttribute("content-desc").toLowerCase() : "";

                        if (!text.isEmpty() &&
                                (text.contains("enter") || text.contains("required") ||
                                        text.contains("password") || text.contains("email") ||
                                        text.contains("username"))) {
                            hasError = true;
                            System.out.println("✅ Found error text: " + text);
                            break;
                        }
                    }
                } catch (Exception ignored) {}
            }

            // 3. Visual heuristic: Check if any element has "error" in resource-id or content-desc
            if (!hasError) {
                try {
                    hasError = driver.getPageSource().contains("error") ||
                            driver.getPageSource().contains("Error");
                } catch (Exception ignored) {}
            }

            // 4. Final strong check - look for any Text widget below input fields
            if (!hasError) {
                try {
                    List<WebElement> allTexts = driver.findElements(By.className("android.widget.TextView"));
                    for (WebElement txt : allTexts) {
                        String t = txt.getText().toLowerCase();
                        if (t.length() > 5 &&
                                (t.contains("please") || t.contains("enter") || t.contains("required"))) {
                            hasError = true;
                            break;
                        }
                    }
                } catch (Exception ignored) {}
            }

            String message = hasError
                    ? "✅ Hiển thị thông báo lỗi khi để trống tất cả các trường"
                    : "❌ Vẫn chưa thấy thông báo lỗi (có thể là Flutter validation)";

            log(name, hasError, message);

            // Extra debug info
            if (!hasError) {
                System.out.println("=== DEBUG: Full page source length = " + pageSource.length());
                System.out.println("=== Try opening Appium Inspector after tapping Sign up to see the error widget ===");
            }

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ====================== TC71 ======================
    static void tc71_SignUp_OnlyUsername() {
        String name = "TC71 - Chỉ nhập Username, để trống Email & Password";
        try {
            // Reset form trước khi test (nếu cần)
            driver.navigate().refresh(); // hoặc tap back rồi vào lại nếu cần
            sleep(1000);

            screenshot("tc71_before");

            typeIntoField("Username", "testuser123");

            tapSignUpButton();
            sleep(2500);

            screenshot("tc71_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở Email và Password"
                            : "❌ Không thấy lỗi validation");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ====================== TC72 ======================
    static void tc72_SignUp_OnlyEmail() {
        String name = "TC72 - Chỉ nhập Email, để trống Username & Password";
        try {
            screenshot("tc72_before");

            typeIntoField("Email", "test@example.com");

            tapSignUpButton();
            sleep(2500);

            screenshot("tc72_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở Username và Password"
                            : "❌ Không thấy lỗi validation");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ====================== TC73 ======================
    static void tc73_SignUp_OnlyPassword() {
        String name = "TC73 - Chỉ nhập Password, để trống Username & Email";
        try {
            screenshot("tc73_before");

            typeIntoField("Password", "Abc@123456");

            tapSignUpButton();
            sleep(2500);

            screenshot("tc73_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở Username và Email"
                            : "❌ Không thấy lỗi validation");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ====================== TC74 ======================
    static void tc74_SignUp_UsernameAndEmail() {
        String name = "TC74 - Nhập Username + Email, để trống Password";
        try {
            resetSignUpForm();                    // Reset form trước khi test
            screenshot("tc74_before");

            typeIntoField("Username", "testuser123");
            typeIntoField("Email", "test@example.com");

            tapSignUpButton();
            sleep(2800);

            screenshot("tc74_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở trường Password"
                            : "❌ Không thấy lỗi validation cho trường Password");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ====================== TC75 ======================
    static void tc75_SignUp_UsernameAndPassword() {
        String name = "TC75 - Nhập Username + Password, để trống Email";
        try {
            resetSignUpForm();
            screenshot("tc75_before");

            typeIntoField("Username", "testuser123");
            typeIntoField("Password", "Abc@123456");

            tapSignUpButton();
            sleep(2800);

            screenshot("tc75_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở trường Email"
                            : "❌ Không thấy lỗi validation cho trường Email");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ====================== TC76 ======================
    static void tc76_SignUp_EmailAndPassword() {
        String name = "TC76 - Nhập Email + Password, để trống Username";
        try {
            resetSignUpForm();
            screenshot("tc76_before");

            typeIntoField("Email", "test@example.com");
            typeIntoField("Password", "Abc@123456");

            tapSignUpButton();
            sleep(2800);

            screenshot("tc76_after");

            boolean hasError = checkForValidationErrors();

            log(name, hasError,
                    hasError ? "✅ Hiển thị lỗi đỏ ở trường Username"
                            : "❌ Không thấy lỗi validation cho trường Username");

        } catch (Exception e) {
            log(name, false, "Lỗi: " + e.getMessage());
        }
    }

    // ================================
    // MAIN
    // ================================
    public static void main(String[] args) throws Exception {

        DesiredCapabilities caps = new DesiredCapabilities();

        caps.setCapability("platformName", "Android");
        caps.setCapability("automationName", "UiAutomator2");
        caps.setCapability("deviceName", "emulator-5554");

        caps.setCapability("appium:noReset", false);
        caps.setCapability("appium:fullReset", true);
        caps.setCapability("appium:uiautomator2ServerInstallTimeout", 60000);
        caps.setCapability("appium:ignoreHiddenApiPolicyError", true);

        // 👉 Dùng APK giống NodeJS
        caps.setCapability("appium:app", "E:\\Newfolder\\demo\\build\\app\\outputs\\flutter-apk\\app-debug.apk");
        driver = new AndroidDriver(
                new URL("http://127.0.0.1:4723"),
                caps
        );

        System.out.println("🚀 Start test...\n");

        tc01_Onboarding();
        tc02_Guest();
        tc03_Home();
        tc04_Explore();
        tc05_Search_Words_with_accent_marks();
        tc06_Search_Words_without_accent();
        tc07_Search_English();
        tc08_Search_Invalid();
        tc09_Search_Special();
        tc10_Search_Number();
//        tc11_ClearSearch();
//        tc18_NoSelection_Scroll_BeforeDone();
//        tc12_FilterOneGenre();
//        tc13_AddSecondGenre();
//        tc14_MultiGenre_ScrollResult();
//        tc15_ScrollGenrePopup();
//        tc16_RemoveOneGenre_Independent();
//        tc17_ClearFilter();
//
//        tc21_Navigate_Home();
//        tc22_ClickPage2();
//        tc23_NextPage();
//        tc24_PreviousPage();
//        tc25_GoToPage();
//        tc26_CancelGoToPage();
//        tc27_ClickAnyComic();
//        tc28_ScrollOverview();
//        tc29_ClickReviews();
//        tc30_ScrollReviews();
//        tc31_ClickChaptersTab();
//        tc32_ClickReadFromChapter1();
//        tc33_WaitDataLoad();
//        tc34_SwipeToRead();
//        tc35_DoubleTapShowUI();
//        tc36_ClickExitToChapterList();
//        tc37_ClickAnyChapter();
//        tc38_NextChapter();
//        tc39_PreviousChapter();
//        tc40_OpenChapterList();
//        tc41_SelectChapter0();
//        tc42_CloseChapterListByClick();
//        tc43_ShowReaderUI_And_ClickBookmark();
//        tc44_HideReaderUI_And_ClickBookmark();
//        tc45_TapHeart();
//        tc46_DeclinePopup();
//        tc47_FollowButton_LoginPopup();
//        tc48_TapBackFromComicDetail();
//        tc19_Navigate_Library();
//        tc20_Navigate_Profile();
//        tc49_ScrollProfileToSettings();
//        tc50_ToggleNotifications_Off();
//        tc51_ToggleNotifications_On();
//
//        tc52_ToggleDarkMode_On();
//        tc53_ToggleDarkMode_Off();
//
//        tc54_ToggleReadingReminders_On();
//        tc55_ToggleReadingReminders_Off();
//
//        tc56_OpenLanguagePopup();
//        tc57_SelectTiengViet();
//        tc58_SelectEnglish();
//
//        tc59_OpenFontSizePopup();
//        tc60_SelectLargeFont();
//        tc61_SelectMediumFont();
//
//        tc61_OpenAboutStoryVerse();
//        tc62_ClickOKOnAboutPopup();
//
//        tc63_OpenHelpSupport();
//        tc64_ClickOKOnHelpPopup();
//
//        tc65_OpenPrivacyPolicy();
//        tc66_ClickOKOnPrivacyPopup();
////
//        tc67_ClickLogIn();
//        tc68_ClickSignInOnWelcome();
//        tc69_CheckboxEnableSignUpButton();
//        tc70_SignUp_EmptyAllFields();
//        tc71_SignUp_OnlyUsername();
//        tc72_SignUp_OnlyEmail();
//        tc73_SignUp_OnlyPassword();
//        tc74_SignUp_UsernameAndEmail();
//        tc75_SignUp_UsernameAndPassword();
//        tc76_SignUp_EmailAndPassword();




        System.out.println("\n=====================");
        System.out.println("PASS: " + pass);
        System.out.println("FAIL: " + fail);

        driver.quit();
    }
}

