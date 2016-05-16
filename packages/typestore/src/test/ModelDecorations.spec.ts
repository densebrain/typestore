
import {
	ModelDescriptor, AttributeDescriptor, IModelOptions,
	IModelAttributeOptions
} from "../decorations/ModelDecorations";
import {TypeStoreAttrKey, TypeStoreModelKey} from "../Constants";
import {getMetadata} from "../MetadataManager";

@ModelDescriptor()
class DecorationTest {

	@AttributeDescriptor()
	myString:string
}

describe('#typestore',() => {
	describe('#model-decorations',() => {

		before(() => {
			new DecorationTest()
		})

		it("#hasModelOptions",() => {
			const md = getMetadata(TypeStoreModelKey,DecorationTest) as IModelOptions
			expect(md.clazz).toBe(DecorationTest)
			expect(md.clazzName).toBe('DecorationTest')
			expect(md.attrs.length).toBe(1)
		})

		it("#hasAttrOptions",() => {
			const md = getMetadata(TypeStoreAttrKey,DecorationTest,'myString') as IModelAttributeOptions
			expect(md.name).toBe('myString')
			expect(md.type).toBe(String)
		})
	})
})
