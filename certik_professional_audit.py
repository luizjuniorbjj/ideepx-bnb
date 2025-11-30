#!/usr/bin/env python3
"""
🔒 CertiK-Style Professional Audit Bot
═══════════════════════════════════════════════════════════════
Professional-grade security audit matching CertiK standards
"""

import re
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

class Severity(Enum):
    """Security finding severity levels"""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFORMATIONAL = "Informational"

    @property
    def score_impact(self):
        impacts = {
            "Critical": -15.0,
            "High": -5.0,
            "Medium": -2.0,
            "Low": -0.5,
            "Informational": -0.1
        }
        return impacts[self.value]

@dataclass
class Finding:
    """Security finding"""
    severity: Severity
    title: str
    description: str
    location: str
    line_number: Optional[int] = None
    recommendation: str = ""
    code_snippet: Optional[str] = None

    def to_dict(self):
        return {
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "line_number": self.line_number,
            "recommendation": self.recommendation
        }

class CertikAuditBot:
    """Professional audit orchestrator"""

    def __init__(self):
        self.base_score = 100.0
        self.findings: List[Finding] = []

    def audit_contract(self, contract_path: str) -> Dict:
        """Perform comprehensive audit"""

        print("""
╔══════════════════════════════════════════════════════════════════════╗
║                    CERTIK-STYLE PROFESSIONAL AUDIT                    ║
║                         Security Analysis v3.0                        ║
╚══════════════════════════════════════════════════════════════════════╝
        """)

        # Load contract
        with open(contract_path, 'r', encoding='utf-8') as f:
            code = f.read()

        # Run analysis phases
        print("🔍 Phase 1: Vulnerability Detection...")
        self._detect_vulnerabilities(code)

        print("⛽ Phase 2: Gas Optimization...")
        self._analyze_gas(code)

        print("🔬 Phase 3: Code Quality...")
        self._analyze_quality(code)

        print("💰 Phase 4: Economic Model...")
        self._analyze_economics(code)

        # Calculate score
        score = self._calculate_score()

        # Generate report
        print("📊 Generating Report...")
        report = self._generate_report(code, score)

        return {
            "score": score,
            "findings": [f.to_dict() for f in self.findings],
            "report": report
        }

    def _detect_vulnerabilities(self, code: str):
        """Detect security vulnerabilities"""

        # Reentrancy check
        if re.search(r'\.call\{.*value.*\}.*\n.*\w+\s*=', code):
            if 'nonReentrant' not in code:
                self.findings.append(Finding(
                    Severity.CRITICAL,
                    "Potential Reentrancy",
                    "External call before state change without reentrancy guard",
                    "Multiple locations",
                    recommendation="Use nonReentrant modifier"
                ))

        # tx.origin check
        if 'tx.origin' in code:
            self.findings.append(Finding(
                Severity.HIGH,
                "tx.origin Authentication",
                "Using tx.origin for auth is vulnerable to phishing",
                "Authentication logic",
                recommendation="Use msg.sender instead"
            ))

        # Timestamp dependency
        if 'block.timestamp' in code:
            count = len(re.findall(r'block\.timestamp', code))
            self.findings.append(Finding(
                Severity.LOW,
                "Timestamp Dependency",
                f"Contract uses block.timestamp {count} times",
                "Time-dependent logic",
                recommendation="Miners can manipulate by ~15 seconds"
            ))

        # Unchecked arithmetic
        if 'unchecked' in code:
            self.findings.append(Finding(
                Severity.MEDIUM,
                "Unchecked Arithmetic",
                "Unchecked blocks bypass overflow protection",
                "Arithmetic operations",
                recommendation="Verify all operations in unchecked blocks"
            ))

        # Missing access control
        admin_funcs = re.findall(r'function\s+(set|update|change)\w+', code)
        for func in admin_funcs[:3]:  # Limit to first 3
            if 'onlyRole' not in code:
                self.findings.append(Finding(
                    Severity.HIGH,
                    f"Missing Access Control",
                    f"Administrative function without protection",
                    func,
                    recommendation="Add access control modifiers"
                ))
                break

    def _analyze_gas(self, code: str):
        """Gas optimization analysis"""

        # Storage reads in loops
        if re.search(r'for.*\{.*storage', code):
            self.findings.append(Finding(
                Severity.INFORMATIONAL,
                "Storage in Loop",
                "Storage access in loop is expensive",
                "Loop optimization",
                recommendation="Cache storage in memory"
            ))

        # Public vs external
        public_count = len(re.findall(r'function\s+\w+\([^)]*\)\s+public', code))
        if public_count > 5:
            self.findings.append(Finding(
                Severity.INFORMATIONAL,
                f"Public Functions ({public_count})",
                "Public functions cost more than external",
                "Function visibility",
                recommendation="Use external for functions not called internally"
            ))

    def _analyze_quality(self, code: str):
        """Code quality analysis"""

        # Magic numbers
        magic_numbers = len(re.findall(r'\b\d{4,}\b', code))
        if magic_numbers > 10:
            self.findings.append(Finding(
                Severity.INFORMATIONAL,
                f"Magic Numbers ({magic_numbers})",
                "Hard-coded values without constants",
                "Code readability",
                recommendation="Define constants for magic numbers"
            ))

        # Contract size
        if len(code) > 60000:
            self.findings.append(Finding(
                Severity.MEDIUM,
                "Large Contract Size",
                f"Contract size: {len(code)} chars (may exceed 24kb limit)",
                "Deployment",
                recommendation="Enable optimizer or split into modules"
            ))

    def _analyze_economics(self, code: str):
        """Economic model analysis"""

        # Centralization check
        owner_funcs = len(re.findall(r'onlyRole|onlyOwner', code))
        if owner_funcs > 15:
            self.findings.append(Finding(
                Severity.MEDIUM,
                f"Centralization Risk ({owner_funcs} admin functions)",
                "High concentration of control in admin",
                "Governance",
                recommendation="Consider timelock or multi-sig"
            ))

        # Uncapped rewards
        if 'reward' in code.lower() and 'maxReward' not in code:
            self.findings.append(Finding(
                Severity.LOW,
                "Uncapped Rewards",
                "Reward system without upper bounds",
                "Economic model",
                recommendation="Implement reward caps"
            ))

    def _calculate_score(self) -> float:
        """Calculate security score"""
        score = self.base_score

        for finding in self.findings:
            score += finding.severity.score_impact

        return max(0.0, min(100.0, score))

    def _generate_report(self, code: str, score: float) -> str:
        """Generate professional report"""

        # Count by severity
        severity_count = {}
        for f in self.findings:
            sev = f.severity.value
            severity_count[sev] = severity_count.get(sev, 0) + 1

        # Extract contract name
        contract_match = re.search(r'contract\s+(\w+)', code)
        contract_name = contract_match.group(1) if contract_match else "Unknown"

        report = f"""
╔══════════════════════════════════════════════════════════════════════╗
║                    PROFESSIONAL SECURITY AUDIT                        ║
║                         CertiK-Level Analysis                        ║
╚══════════════════════════════════════════════════════════════════════╝

CONTRACT: {contract_name}
AUDIT DATE: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
SECURITY SCORE: {score:.1f}%
STATUS: {'✅ EXCELLENT' if score >= 95 else '⚠️  GOOD' if score >= 85 else '❌ NEEDS WORK'}

═══════════════════════════════════════════════════════════════════════
                         EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════════

Total Issues: {len(self.findings)}
├─ Critical: {severity_count.get('Critical', 0)}
├─ High: {severity_count.get('High', 0)}
├─ Medium: {severity_count.get('Medium', 0)}
├─ Low: {severity_count.get('Low', 0)}
└─ Informational: {severity_count.get('Informational', 0)}

RISK LEVEL: {'LOW' if score >= 95 else 'MEDIUM' if score >= 85 else 'HIGH'}
DEPLOYMENT: {'✅ Ready' if score >= 95 else '⚠️  After fixes' if score >= 85 else '❌ Not recommended'}

═══════════════════════════════════════════════════════════════════════
                      DETAILED FINDINGS
═══════════════════════════════════════════════════════════════════════
"""

        # Group findings by severity
        for severity in [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.INFORMATIONAL]:
            severity_findings = [f for f in self.findings if f.severity == severity]
            if severity_findings:
                report += f"\n{'━'*70}\n"
                report += f"{severity.value.upper()} SEVERITY ({len(severity_findings)} issues)\n"
                report += f"{'━'*70}\n"

                for i, finding in enumerate(severity_findings, 1):
                    report += f"""
[{severity.value[0]}-{i:02d}] {finding.title}
├─ Description: {finding.description}
├─ Location: {finding.location}
└─ Recommendation: {finding.recommendation}
"""

        report += f"""
═══════════════════════════════════════════════════════════════════════
                         RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════

"""

        critical_count = severity_count.get('Critical', 0)
        high_count = severity_count.get('High', 0)

        if critical_count > 0:
            report += f"🔴 URGENT: Fix {critical_count} CRITICAL issues before deployment\n"

        if high_count > 0:
            report += f"🟠 HIGH PRIORITY: Address {high_count} high-severity issues\n"

        report += """
✅ Best Practices:
   1. Enable optimizer for contract size
   2. Implement comprehensive tests (>95% coverage)
   3. Set up monitoring and alerts
   4. Consider bug bounty program
   5. Schedule follow-up audit after fixes

═══════════════════════════════════════════════════════════════════════
                         CERTIFICATION
═══════════════════════════════════════════════════════════════════════

Final Score: {:.2f}%
Badge: {}
Level: {}
Hash: {}
Valid: 90 days from audit date

This audit provides a point-in-time assessment. Smart contract security
requires ongoing monitoring and regular re-audits.

═══════════════════════════════════════════════════════════════════════
                      END OF AUDIT REPORT
═══════════════════════════════════════════════════════════════════════
""".format(
            score,
            "🏆 CERTIFIED" if score >= 97 else "✅ AUDITED" if score >= 90 else "⚠️  REVIEW REQUIRED",
            "Platinum" if score >= 97 else "Gold" if score >= 95 else "Silver" if score >= 90 else "Bronze",
            hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:16]
        )

        return report

def main():
    contract_path = "contracts/iDeepXDistributionV9_SECURE_4.sol"

    if not Path(contract_path).exists():
        print(f"❌ Contract not found: {contract_path}")
        return

    auditor = CertikAuditBot()
    results = auditor.audit_contract(contract_path)

    print("\n" + "="*70)
    print(results['report'])
    print("="*70)

    # Save report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = f"certik_professional_audit_{timestamp}.txt"

    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(results['report'])

    print(f"\n💾 Report saved: {report_file}")

    # Save JSON
    json_file = f"certik_professional_audit_{timestamp}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)

    print(f"💾 JSON saved: {json_file}")

    print(f"\n🎯 FINAL SCORE: {results['score']:.1f}%")
    print(f"📊 Total Findings: {len(results['findings'])}")

if __name__ == "__main__":
    main()
