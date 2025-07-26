import { Datalist, DropdownOption } from '@/constants/index';

// Mock Domain Service Data (simuliert API-Call)
const mockDomainData: Datalist[] =[{
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglAnredeSfrBerechtigter",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "",
                "label": ""
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "m",
                "label": "Herr"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "w",
                "label": "Frau"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "n",
                "label": "unbekannt"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglAkademischetitel",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "",
                "label": ""
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0001",
                "label": "Agr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0003",
                "label": "Ass. jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0002",
                "label": "Assessor"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0004",
                "label": "B.A."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0162",
                "label": "B.Ed."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0005",
                "label": "B.Eng."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0163",
                "label": "B.F.A."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0164",
                "label": "B.Mus."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0006",
                "label": "B.Sc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0007",
                "label": "Betrw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0008",
                "label": "Bibl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0009",
                "label": "Biol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0010",
                "label": "Chem."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0011",
                "label": "Comm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0012",
                "label": "D."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0013",
                "label": "D.theol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0014",
                "label": "Dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0015",
                "label": "Dipl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0016",
                "label": "Dipl.-Betrw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0017",
                "label": "Dipl.-Bibl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0018",
                "label": "Dipl.-Biol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0019",
                "label": "Dipl.-Chem."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0020",
                "label": "Dipl.-Des."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0021",
                "label": "Dipl.-Dolm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0210",
                "label": "Dipl.-Finw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0022",
                "label": "Dipl.-Hdl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0023",
                "label": "Dipl.-Hist."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0024",
                "label": "Dipl.-Inform"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0025",
                "label": "Dipl.-Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0026",
                "label": "Dipl.-Jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0027",
                "label": "Dipl.-Kauff."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0028",
                "label": "Dipl.-Kaufm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0029",
                "label": "Dipl.-Ldw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0030",
                "label": "Dipl.-Math."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0031",
                "label": "Dipl.-Med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0171",
                "label": "Dipl.-Med.Vet."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0032",
                "label": "Dipl.-Met."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0033",
                "label": "Dipl.-Oec."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0034",
                "label": "Dipl.-Päd."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0035",
                "label": "Dipl.-Phys."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0036",
                "label": "Dipl.-Psych."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0214",
                "label": "Dipl.-Reg."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0037",
                "label": "Dipl.-Soz."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0038",
                "label": "Dipl.-Sportl"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0039",
                "label": "Dipl.-Vet."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0040",
                "label": "Dipl.-Volksw"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0041",
                "label": "Dipl.-Wirt.I"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0172",
                "label": "Dipl.Stom."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0042",
                "label": "Disc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0043",
                "label": "Dolm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0044",
                "label": "Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0049",
                "label": "Dr.-Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0213",
                "label": "Dr.-Ing. Dr. rer. nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0059",
                "label": "Dr.Dipl.Biol"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0060",
                "label": "Dr.Dipl.Chem"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0061",
                "label": "Dr.Dipl.Geol"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0062",
                "label": "Dr.Dipl.Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0063",
                "label": "Dr.Dipl.Kfm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0064",
                "label": "Dr.Dipl.Psy."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0065",
                "label": "Dr.Dipl.Vw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0045",
                "label": "Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0046",
                "label": "Dr.Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0174",
                "label": "Dr.Dr.Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0173",
                "label": "Dr.Dr.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0175",
                "label": "Dr.Dr.jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0047",
                "label": "Dr.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0176",
                "label": "Dr.Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0177",
                "label": "Dr.Dr.phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0048",
                "label": "Dr.E."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0058",
                "label": "Dr.agr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0066",
                "label": "Dr.disc.pol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0068",
                "label": "Dr.e.h."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0069",
                "label": "Dr.forest."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0070",
                "label": "Dr.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0071",
                "label": "Dr.h.c.mult."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0178",
                "label": "Dr.habil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0050",
                "label": "Dr.jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0051",
                "label": "Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0211",
                "label": "Dr.med.Dipl-Ing"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0179",
                "label": "Dr.med.Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0073",
                "label": "Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0180",
                "label": "Dr.med.habil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0161",
                "label": "Dr.med.phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0208",
                "label": "Dr.med.univ."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0074",
                "label": "Dr.med.vet."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0052",
                "label": "Dr.mult."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0075",
                "label": "Dr.nat.techn"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0053",
                "label": "Dr.oec."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0076",
                "label": "Dr.oec.publ."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0054",
                "label": "Dr.paed."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0055",
                "label": "Dr.pharm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0056",
                "label": "Dr.phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0077",
                "label": "Dr.phil.nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0083",
                "label": "Dr.rer.Oec."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0078",
                "label": "Dr.rer.comm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0079",
                "label": "Dr.rer.hort."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0215",
                "label": "Dr.rer.medic."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0080",
                "label": "Dr.rer.mont."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0081",
                "label": "Dr.rer.nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0082",
                "label": "Dr.rer.oec."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0084",
                "label": "Dr.rer.pol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0181",
                "label": "Dr.rer.soc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0085",
                "label": "Dr.rer.techn"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0086",
                "label": "Dr.sc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0182",
                "label": "Dr.sc.arg."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0087",
                "label": "Dr.sc.hum."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0088",
                "label": "Dr.sc.math."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0183",
                "label": "Dr.sc.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0089",
                "label": "Dr.sc.nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0090",
                "label": "Dr.sc.pol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0057",
                "label": "Dr.theol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0092",
                "label": "Dres."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0093",
                "label": "Dres. med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0094",
                "label": "Drs"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0095",
                "label": "E.H."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0096",
                "label": "Forest."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0097",
                "label": "Grad."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0098",
                "label": "H.C."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0099",
                "label": "Hdl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0100",
                "label": "Hist."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0101",
                "label": "Hort."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0102",
                "label": "Hum."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0103",
                "label": "Inform."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0104",
                "label": "Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0105",
                "label": "Jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0106",
                "label": "Kauff."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0107",
                "label": "Kfm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0110",
                "label": "LL.B."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0111",
                "label": "LL.M."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0108",
                "label": "Ldw."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0109",
                "label": "Lic.Oec."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0114",
                "label": "M.A."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0115",
                "label": "M.B.L."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0169",
                "label": "M.Ed."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0166",
                "label": "M.Eng."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0167",
                "label": "M.F.A."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0168",
                "label": "M.Mus."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0165",
                "label": "M.Sc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0116",
                "label": "MAS"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0118",
                "label": "MBA"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0119",
                "label": "MBI"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0184",
                "label": "MD Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0185",
                "label": "MD Prof.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0122",
                "label": "MIM"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0186",
                "label": "MR Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0187",
                "label": "MR Prof.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0124",
                "label": "MSc"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0112",
                "label": "Mag.jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0113",
                "label": "Magister"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0117",
                "label": "Math."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0120",
                "label": "Med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0121",
                "label": "Met."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0123",
                "label": "Mont."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0125",
                "label": "Mult."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0126",
                "label": "Nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0127",
                "label": "Ök."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0188",
                "label": "OMD Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0189",
                "label": "OMR Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0190",
                "label": "OMR Prof.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0129",
                "label": "PD Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0130",
                "label": "PD Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0131",
                "label": "PD Dr.jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0132",
                "label": "PD Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0191",
                "label": "PD Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0192",
                "label": "PD Dr.med.habil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0133",
                "label": "PD Dr.mult."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0134",
                "label": "PD Prof.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0128",
                "label": "Päd."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0135",
                "label": "Pharm."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0136",
                "label": "Phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0137",
                "label": "Phys."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0138",
                "label": "Pol."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0194",
                "label": "Pr.Doz.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0195",
                "label": "Pr.Doz.Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0196",
                "label": "Pr.Doz.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0197",
                "label": "Pr.Doz.Dr.med.habil"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0193",
                "label": "Pr.Doz.Prof.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0139",
                "label": "Priv.-Doz."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0140",
                "label": "Prof."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0212",
                "label": "Prof. Dr.Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0142",
                "label": "Prof.Dipl.I."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0143",
                "label": "Prof.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0144",
                "label": "Prof.Dr.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0207",
                "label": "Prof.Dr.Dr.Dr.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0198",
                "label": "Prof.Dr.Dr.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0199",
                "label": "Prof.Dr.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0200",
                "label": "Prof.Dr.Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0201",
                "label": "Prof.Dr.Dr.phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0216",
                "label": "Prof.Dr.Ing-.habil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0145",
                "label": "Prof.Dr.Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0202",
                "label": "Prof.Dr.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0209",
                "label": "Prof.Dr.h.c.mult."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0146",
                "label": "Prof.Dr.jur."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0147",
                "label": "Prof.Dr.med."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0203",
                "label": "Prof.Dr.med.dent."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0217",
                "label": "Prof.Dr.med.habil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0148",
                "label": "Prof.Dr.phil"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0204",
                "label": "Prof.Dr.phil."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0205",
                "label": "Prof.Dr.rer.nat."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0206",
                "label": "Prof.Dr.sc."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0141",
                "label": "Prof.Ing."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0150",
                "label": "Prof.h.c."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0170",
                "label": "Prof.h.c.Dr."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0149",
                "label": "Professor"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0151",
                "label": "Psych."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0152",
                "label": "Publ."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0153",
                "label": "Rer."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0154",
                "label": "SC."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0155",
                "label": "Soz."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0156",
                "label": "Sportl."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0157",
                "label": "Techn."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0158",
                "label": "Vet."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0159",
                "label": "Volkswirt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0160",
                "label": "Wirt."
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglReferenzSfKlasse",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "",
                "label": ""
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0",
                "label": "Klasse 0"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "S",
                "label": "Schadenklasse"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "M",
                "label": "Malusklasse"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SFHL",
                "label": "SF 1/2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "1",
                "label": "SF1"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "2",
                "label": "SF2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "3",
                "label": "SF3"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "4",
                "label": "SF4"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "5",
                "label": "SF5"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "6",
                "label": "SF6"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "7",
                "label": "SF7"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "8",
                "label": "SF8"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "9",
                "label": "SF9"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "10",
                "label": "SF10"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "11",
                "label": "SF11"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "12",
                "label": "SF12"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "13",
                "label": "SF13"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "14",
                "label": "SF14"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "15",
                "label": "SF15"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "16",
                "label": "SF16"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "17",
                "label": "SF17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "18",
                "label": "SF18"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "19",
                "label": "SF19"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "20",
                "label": "SF20"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "21",
                "label": "SF21"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "22",
                "label": "SF22"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "23",
                "label": "SF23"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "24",
                "label": "SF24"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "25",
                "label": "SF25"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "26",
                "label": "SF26"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "27",
                "label": "SF27"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "28",
                "label": "SF28"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "29",
                "label": "SF29"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "30",
                "label": "SF30"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "31",
                "label": "SF31"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "32",
                "label": "SF32"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "33",
                "label": "SF33"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "34",
                "label": "SF34"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "35",
                "label": "SF35"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "36",
                "label": "SF36"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "37",
                "label": "SF37"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "38",
                "label": "SF38"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "39",
                "label": "SF39"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "40",
                "label": "SF40"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "41",
                "label": "SF41"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "42",
                "label": "SF42"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "43",
                "label": "SF43"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "44",
                "label": "SF44"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "45",
                "label": "SF45"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "46",
                "label": "SF46"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "47",
                "label": "SF47"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "48",
                "label": "SF48"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "49",
                "label": "SF49"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "50",
                "label": "SF50"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglKennzeichenarten",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "01",
                "label": "normal"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "13",
                "label": "ständig rotes Kennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "15",
                "label": "Wechselkennzeichen Deutschland"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "17",
                "label": "Historisches Wechselkennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "19",
                "label": "Historienkennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "30",
                "label": "E-Kennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "09",
                "label": "grünes Kennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "10",
                "label": "Diplomatenkennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "11",
                "label": "sonstiges deutsches Sonderkennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "12",
                "label": "ausländisches Kennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "18",
                "label": "Behörden-/Semidiplomatenkennzeichen"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglFzgArt",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KFZ0001",
                "label": "1 PKW"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglFzgVerwendung",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KFZ001",
                "label": "1 Ohne Vermietung"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglSfEinstufungKh",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "01",
                "label": "01 Neueinstufung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "02",
                "label": "02 Zweitwagenregelung SF 1/2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "03",
                "label": "03 Führerscheinregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "04",
                "label": "04 Ehegattenregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "06",
                "label": "06 Versichererwechselbescheinigung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "12",
                "label": "12 SF-Einstufung ausl. Vorvers. oder andere Bescheinigung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "13",
                "label": "13 Berichtigung der SF-Einstufung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "18",
                "label": "18 Kundenkinderregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "21",
                "label": "21 Zweitwagenregelung SF 2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "22",
                "label": "22 Sommer-/Winterregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "28",
                "label": "28 Nachträglicher/unbelastender Schaden"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "30",
                "label": "30 Übernahme aus anderem System oder Vertrag"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglSfEinstufungVk",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "01",
                "label": "01 Neueinstufung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "02",
                "label": "02 Zweitwagenregelung SF 1/2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "03",
                "label": "03 Führerscheinregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "04",
                "label": "04 Ehegattenregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "06",
                "label": "06 Versichererwechselbescheinigung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "12",
                "label": "12 SF-Einstufung ausl. Vorvers. oder andere Bescheinigung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "13",
                "label": "13 Berichtigung der SF-Einstufung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "17",
                "label": "17 Angleichung an KH"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "18",
                "label": "18 Kundenkinderregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "21",
                "label": "21 Zweitwagenregelung SF 2"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "22",
                "label": "22 Sommer-/Winterregelung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "28",
                "label": "28 Nachträglicher/unbelastender Schaden"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "30",
                "label": "30 Übernahme aus anderem System oder Vertrag"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglFahrerkreis",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "E",
                "label": "Einzelfahrer"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "P",
                "label": "Partnertarif"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "F",
                "label": "Familienfahrer"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "M",
                "label": "Beliebige Fahrer mit Mindestalter"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglTarifgruppe",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "A - Landwirtschaft"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "B",
                "label": "B - Beamte und Beschäftigte im öffentlichen Dienst"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "R",
                "label": "R - Sonstige"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglWirtschaftszweig",
        "options": []
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglKraftVertragZusVnHalterBez",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "0",
                "label": ""
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "1",
                "label": "Werksangehöriger"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "2",
                "label": "Leasingnehmer"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "3",
                "label": "Kreditgeber / Leasinggeber"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "4",
                "label": "Ehepartner / Lebenspartner"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "5",
                "label": "Elternteil"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "6",
                "label": "Firma (VN=Geschäftsführer/-inhaber der Firma) / Geschäftsführer"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "7",
                "label": "Kfz-Händler"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "8",
                "label": "Kind des Antragstellers"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "9",
                "label": "sonstige"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "10",
                "label": "behindertes Elternteil"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "11",
                "label": "behindertes Kind"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "99",
                "label": "nicht vorhanden bzw. abgewählt"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglInkassoart",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "Lastschrift"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "E",
                "label": "Überweisung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "W",
                "label": "Vermittlerinkasso"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglKmAngabeGrund",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "99",
                "label": "Bitte eingeben"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "1",
                "label": "Versicherungsbeginn"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "6",
                "label": "Antragsaufnahme"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "2",
                "label": "km-Anfrage"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "10",
                "label": "bei Änderung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "8",
                "label": "freiwillige Meldung VN"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KF",
                "label": "Kilometerstand fehlt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SK",
                "label": "Kilometerstand zu Schadenereignis"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SG",
                "label": "Kilometerstand aus Gutachten, Werkstatt"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglArtZubehoerteil",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB998",
                "label": "Bitte eingeben"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB300",
                "label": "Fahrwerktuning"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB301",
                "label": "Triebwerktuning"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB302",
                "label": "Auspufftuning"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB303",
                "label": "Innenraumtuning"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB304",
                "label": "Karosserietuning"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB305",
                "label": "Sonderlackierung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB306",
                "label": "Sonderbeschriftung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB307",
                "label": "Besondere Oberflächenbehandlung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZUB350",
                "label": "Sonstiger Fahrzeugmehrwert"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglStornogruendeSparte",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "",
                "label": ""
            },{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SER",
                "label": "Ersatz"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SVN",
                "label": "Kündigung VN/Verfall"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SGE",
                "label": "Kündigung VU"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SVZ",
                "label": "Rücktritt VU mangels Zahlung der Erstprämie"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SMZ",
                "label": "Storno mangels Zahlung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SVE",
                "label": "nach Vereinbarung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SBG",
                "label": "Widerruf/Aufhebung ab Beginn"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SPK",
                "label": "VN wg. Prämienanpassung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SSC",
                "label": "nach Schaden durch VN"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "TST",
                "label": "Technisches Storno"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglVertragZustandKH",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": " ",
                "label": " "
            },{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "Aktiv"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "S",
                "label": "Storno"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "R",
                "label": "ruhend"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglVertragZustandVK",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": " ",
                "label": " "
            },{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "Aktiv"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "S",
                "label": "Storno"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "R",
                "label": "ruhend"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglVertragZustandTK",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": " ",
                "label": " "
            },{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "Aktiv"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "S",
                "label": "Storno"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "R",
                "label": "ruhend"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglVertragZustandKU",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": " ",
                "label": " "
            },{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "A",
                "label": "Aktiv"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "S",
                "label": "Storno"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "R",
                "label": "ruhend"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglAbschlagsgruende",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "2",
                "label": "Konkurrenzangebot"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KL",
                "label": "sonstige Gründe"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "6",
                "label": "Geno-Tarif"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "12",
                "label": "erhöhte Selbstbeteiligung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KG",
                "label": "Individuelle Vereinbarung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KH",
                "label": "KH-Selbstbeteiligung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K5",
                "label": "Kleinflotten"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "28",
                "label": "Direktionsanfrage"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "33",
                "label": "Sonderanhänger - Arbeitsmaschine"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "36",
                "label": "Verkehrsrisiko bei Arbeitsmaschinen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "37",
                "label": "nichtöffentl. Straßenverk."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "70",
                "label": "Treuebonus"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "71",
                "label": "Technischer Nachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "72",
                "label": "Fehlerkorrektur"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "73",
                "label": "Direktionsanfrage"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "74",
                "label": "Nachlass BÜ Vorsystem"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "76",
                "label": "Ausgleichnachlass BÜ Vorsystem "
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "88",
                "label": "Internet KU-Nachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "97",
                "label": "Bestandskundenbonus"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "B7",
                "label": "Nachlass Begleitetes Fahren ab 17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KI",
                "label": "Wechselkennzeichen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KJ",
                "label": "Nachlass aufgrund passiven BF17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KK",
                "label": "Nachlass aufgrund aktiven BF17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KT",
                "label": "Konzeptrabatt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KW",
                "label": "Risikobonus"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "NT",
                "label": "Nettotarif"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "SR",
                "label": "Sonstiger Nachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K8",
                "label": "PayPerDay"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "RK",
                "label": "Kündigerrückgewinnung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KM",
                "label": "Orts- und Korporativclubs"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KS",
                "label": "Fahrsicherheitstraining"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "US",
                "label": "Underwriter Sonderrabatt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KY",
                "label": "privat genutzt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "RN",
                "label": "Risk Adjustment Nachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "MJ",
                "label": "Market Adjustment"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "FN",
                "label": "Fuhrparknachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "NF",
                "label": "Nachlass Fehlerkorrektur"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "NP",
                "label": "Nachlass adaptives Pricing"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "TU",
                "label": "TU Gesamtrabatt"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "AS",
                "label": "Assistenzsystem"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "HN",
                "label": "Händlernachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "TM",
                "label": "Telematik"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "VT",
                "label": "Vertriebsnachlass"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "MW",
                "label": "Nachlass für E-Fahrzeuge"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ML",
                "label": "Nachlass für Maklerpakete"
            }
        ]
    }, {
        "classId": "com.allianz.cisl.base.datalist.Datalist",
        "id": "KraftBoGruppeMoeglZuschlagsgruende",
        "options": [{
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "3",
                "label": "sonstige Gründe"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "8",
                "label": "Gefahrenklasse"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "9",
                "label": "Gefährliche Stoffe"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KA",
                "label": "GeK 10.226 EUR"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KB",
                "label": "GeK 25.565 EUR"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KC",
                "label": "Variable GeK"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "16",
                "label": "Höherwertiges Fahrzeug"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "17",
                "label": "Lasten heben"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "19",
                "label": "Ausnahmegenehmigung §70 StVO"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "20",
                "label": "verringerte Selbstbeteiligung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "22",
                "label": "Vermietung an Selbstfahrer"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "24",
                "label": "Verwendung auf Flughafenvorfeld"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "25",
                "label": "Mehrwert"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K2",
                "label": "Hakenlastversicherung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "38",
                "label": "Sanierung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "40",
                "label": "Zuschl.pflichtiger Neuwert b. Arbeitsma."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K3",
                "label": "Differenzkasko"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "46",
                "label": "Tuningfahrzeug"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "49",
                "label": "Abweichende Halterschaft"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "51",
                "label": "Premiumkasko"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K4",
                "label": "Erhöhung DS Arbeitsrisiko auf 50 Mio."
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "64",
                "label": "Güterfolgeschäden"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "66",
                "label": "Versicherungskennz. sonst. gewerbl. Risiko"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "67",
                "label": "Versicherungskennz. gewerbl. Risiko Vermietung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "75",
                "label": "Zuschlag BÜ Vorsystem"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "77",
                "label": "Ausgleichzuschlag  BÜ Vorsystem "
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "98",
                "label": "nicht Online-Nutzung"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "99",
                "label": "bevollmächtigter Underwriter"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K0",
                "label": "Brems-/ Betriebs-/ Bruchschäden"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K1",
                "label": "Personenbeförderung auf Güterfahrzeugen"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K6",
                "label": "Zuschlag Begleitetes Fahren ab 17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KE",
                "label": "Erhöhung DS für Arbeitsrisiko"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KF",
                "label": "aktives BF17"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "KX",
                "label": "Risikozuschlag"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "AA",
                "label": "Anfragepflichtige Wirtschaftsbranche"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "K9",
                "label": "Winterdienst"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "RZ",
                "label": "Risk Adjustment Zuschlag"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "T3",
                "label": "Sonstiger Zuschlag"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZF",
                "label": "Zuschlag Fehlerkorrektur"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "ZP",
                "label": "Zuschlag adaptives Pricing"
            }, {
                "classId": "com.allianz.cisl.base.datalist.Option",
                "value": "MK",
                "label": "Zuschlag für Maklerpakete"
            }
        ]
    }
]
;

// Simuliert API-Call zum Domain Service
export const fetchDomainData = async (domainId: string): Promise<DropdownOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const datalist = mockDomainData.find(d => d.id === domainId);
  return datalist?.options || [];
};
