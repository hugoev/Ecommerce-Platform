package com.group7.ecommerce.springbackend.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DiscountCodeDataInitializer implements CommandLineRunner {

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no discount codes exist
        if (discountCodeRepository.count() == 0) {
            createSampleDiscountCodes();
        }
    }

    private void createSampleDiscountCodes() {
        // 10% off code
        DiscountCode code10 = new DiscountCode();
        code10.setCode("SAVE10");
        code10.setDiscountPercentage(new BigDecimal("10.00"));
        code10.setExpiryDate(OffsetDateTime.now().plus(30, ChronoUnit.DAYS));
        code10.setActive(true);
        discountCodeRepository.save(code10);

        // 20% off code
        DiscountCode code20 = new DiscountCode();
        code20.setCode("SAVE20");
        code20.setDiscountPercentage(new BigDecimal("20.00"));
        code20.setExpiryDate(OffsetDateTime.now().plus(15, ChronoUnit.DAYS));
        code20.setActive(true);
        discountCodeRepository.save(code20);

        // 5% off code (expired)
        DiscountCode code5 = new DiscountCode();
        code5.setCode("EXPIRED5");
        code5.setDiscountPercentage(new BigDecimal("5.00"));
        code5.setExpiryDate(OffsetDateTime.now().minus(1, ChronoUnit.DAYS));
        code5.setActive(false);
        discountCodeRepository.save(code5);

        // 15% off code
        DiscountCode code15 = new DiscountCode();
        code15.setCode("WELCOME15");
        code15.setDiscountPercentage(new BigDecimal("15.00"));
        code15.setExpiryDate(OffsetDateTime.now().plus(7, ChronoUnit.DAYS));
        code15.setActive(true);
        discountCodeRepository.save(code15);
    }
}
