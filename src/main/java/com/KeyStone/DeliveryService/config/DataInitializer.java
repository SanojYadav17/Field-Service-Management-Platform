package com.KeyStone.DeliveryService.config;

import com.KeyStone.DeliveryService.domain.*;
import com.KeyStone.DeliveryService.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository workOrderStatusHistoryRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Clean up any existing database records containing parenthetical suffixes
        userRepository.findAll().forEach(u -> {
            if (u.getFullName() != null && u.getFullName().contains("(")) {
                u.setFullName(u.getFullName().replaceAll("\\s*\\([^)]*\\)", ""));
                userRepository.save(u);
            }
        });

        if (userRepository.count() == 0) {
            log.info("Populating initial seed data into Neon PostgreSQL database...");

            String defaultPasswordHash = passwordEncoder.encode("password123");

            User admin = userRepository.save(User.builder()
                    .email("admin@meridian.com")
                    .passwordHash(defaultPasswordHash)
                    .fullName("Marcus Vance")
                    .role(Role.ADMIN)
                    .phone("+1-555-0101")
                    .active(true)
                    .build());

            User dispatcher = userRepository.save(User.builder()
                    .email("dispatcher@meridian.com")
                    .passwordHash(defaultPasswordHash)
                    .fullName("Diana Ross")
                    .role(Role.DISPATCHER)
                    .phone("+1-555-0102")
                    .active(true)
                    .build());

            User techJohn = userRepository.save(User.builder()
                    .email("tech.john@meridian.com")
                    .passwordHash(defaultPasswordHash)
                    .fullName("John Doe")
                    .role(Role.TECHNICIAN)
                    .phone("+1-555-0103")
                    .active(true)
                    .build());

            User techSarah = userRepository.save(User.builder()
                    .email("tech.sarah@meridian.com")
                    .passwordHash(defaultPasswordHash)
                    .fullName("Sarah Connor")
                    .role(Role.TECHNICIAN)
                    .phone("+1-555-0104")
                    .active(true)
                    .build());

            userRepository.save(User.builder()
                    .email("customer.acme@meridian.com")
                    .passwordHash(defaultPasswordHash)
                    .fullName("Alice Smith")
                    .role(Role.CUSTOMER)
                    .phone("+1-555-0105")
                    .active(true)
                    .build());

            // Initial Customers
            Customer custAcme = customerRepository.save(Customer.builder()
                    .name("Acme Corporation")
                    .code("CUST-ACME")
                    .contactEmail("customer.acme@meridian.com")
                    .contactPhone("+1-555-1000")
                    .address("100 Industrial Parkway, Building A")
                    .active(true)
                    .build());

            Customer custApex = customerRepository.save(Customer.builder()
                    .name("Apex Commercial Real Estate")
                    .code("CUST-APEX")
                    .contactEmail("facilities@apexre.com")
                    .contactPhone("+1-555-2000")
                    .address("500 Skyline Boulevard, Suite 1200")
                    .active(true)
                    .build());

            Customer custNexus = customerRepository.save(Customer.builder()
                    .name("Nexus Retail Group")
                    .code("CUST-NEXUS")
                    .contactEmail("ops@nexusretail.com")
                    .contactPhone("+1-555-3000")
                    .address("750 Galleria Way")
                    .active(true)
                    .build());

            // Sites
            siteRepository.save(Site.builder()
                    .name("Acme HQ Building A")
                    .address("100 Industrial Parkway, Tower A")
                    .customer(custAcme)
                    .contactPerson("Alice Smith")
                    .active(true)
                    .build());

            siteRepository.save(Site.builder()
                    .name("Acme R&D Lab Facility")
                    .address("102 Industrial Parkway, Building B")
                    .customer(custAcme)
                    .contactPerson("Robert Johnson")
                    .active(true)
                    .build());

            siteRepository.save(Site.builder()
                    .name("Apex Financial Plaza")
                    .address("500 Skyline Blvd, Main Tower")
                    .customer(custApex)
                    .contactPerson("David Miller")
                    .active(true)
                    .build());

            siteRepository.save(Site.builder()
                    .name("Metro Galleria Mall - South")
                    .address("750 Galleria Way, South Wing")
                    .customer(custNexus)
                    .contactPerson("Karen White")
                    .active(true)
                    .build());

            log.info("Neon PostgreSQL database user & asset seed initialization complete!");
        }

        seedGenuineAssets();
    }

    private void seedGenuineAssets() {
        // Genuine Industrial Spare Parts Catalog
        savePartIfAbsent("Carrier MERV 13 Air Filter (24x24x2)", "PRT-HVAC-FLT13", new BigDecimal("1450.00"), 40, 10);
        savePartIfAbsent("Honeywell Smart Thermostat T6 Pro", "PRT-HVAC-T6PRO", new BigDecimal("12500.00"), 15, 4);
        savePartIfAbsent("Honeywell 2-Way Zone Valve Actuator (24V)", "PRT-HVAC-ACT24", new BigDecimal("4850.00"), 12, 3);
        savePartIfAbsent("Dupont R-410A Eco Refrigerant Tank (25 lbs)", "PRT-HVAC-R410A", new BigDecimal("16800.00"), 8, 2);
        savePartIfAbsent("Copeland Scroll Compressor 5HP 3-Phase", "PRT-HVAC-CMP5H", new BigDecimal("45000.00"), 4, 1);
        savePartIfAbsent("Schneider Electric 3-Pole 32A MCB Breaker", "PRT-ELE-MCB32", new BigDecimal("2200.00"), 25, 6);
        savePartIfAbsent("Siemens 3-Phase 100A Moulded Case Circuit Breaker", "PRT-ELE-MCC100", new BigDecimal("18500.00"), 6, 2);
        savePartIfAbsent("Finolex 4-Core 16 sq.mm Armored Copper Cable (50m)", "PRT-ELE-CBL16M", new BigDecimal("14200.00"), 10, 3);
        savePartIfAbsent("L&T 3-Phase Automatic Voltage Stabilizer Relay", "PRT-ELE-LTVR3", new BigDecimal("7600.00"), 8, 2);
        savePartIfAbsent("Philips Master LED Tube 18W T8 High Bay Light", "PRT-ELE-LED18W", new BigDecimal("480.00"), 100, 20);
        savePartIfAbsent("Astral CPVC Heavy Duty Pipe 1-inch (10ft)", "PRT-PLM-CPVC1", new BigDecimal("650.00"), 30, 8);
        savePartIfAbsent("Zurn Commercial Dual-Flush Sensor Valve Kit", "PRT-PLM-FLSHK", new BigDecimal("8900.00"), 14, 4);
        savePartIfAbsent("Grundfos Stainless Steel Booster Pump Impeller", "PRT-PLM-PMPIMP", new BigDecimal("11200.00"), 5, 2);
        savePartIfAbsent("Cisco Cat6A Shielded Ethernet Cable (305m Spool)", "PRT-NET-CAT6A", new BigDecimal("11500.00"), 7, 2);
        savePartIfAbsent("Ubiquiti UniFi Protect 4K Vandal-Proof IP Camera", "PRT-SEC-CAM4K", new BigDecimal("22400.00"), 9, 3);

        // Genuine Enterprise Clients
        saveCustomerIfAbsent("Tata Consultancy Services", "CUST-TCS", "facilities.cyberabad@tcs.com", "+91-40-6667-0000", "Synergy Park, HITEC City, Hyderabad");
        saveCustomerIfAbsent("Reliance Corporate Park", "CUST-RELIANCE", "infra.ops@ril.com", "+91-22-4477-0000", "Thane-Belapur Road, Ghansoli, Navi Mumbai");
        saveCustomerIfAbsent("DLF Cyber City Developers", "CUST-DLF", "estate.mgmt@dlf.in", "+91-124-4567-890", "DLF Cyber City, Phase II, Gurugram, Haryana");
    }

    private void saveCustomerIfAbsent(String name, String code, String email, String phone, String address) {
        if (customerRepository.findByCode(code).isEmpty()) {
            Customer c = customerRepository.save(Customer.builder()
                    .name(name)
                    .code(code)
                    .contactEmail(email)
                    .contactPhone(phone)
                    .address(address)
                    .active(true)
                    .build());

            siteRepository.save(Site.builder()
                    .name(name + " - Main HQ Tower")
                    .address(address)
                    .customer(c)
                    .contactPerson("Facility Manager")
                    .active(true)
                    .build());
        }
    }

    private void savePartIfAbsent(String name, String sku, BigDecimal unitCost, int stockQty, int minStockLevel) {
        if (partRepository.findBySku(sku).isEmpty()) {
            partRepository.save(Part.builder()
                    .name(name)
                    .sku(sku)
                    .unitCost(unitCost)
                    .stockQty(stockQty)
                    .minStockLevel(minStockLevel)
                    .build());
        }
    }
}
